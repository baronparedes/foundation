import type {
  Prisma,
  Project,
  ProjectAddOn,
  ProjectSetting,
  ProjectVoucher,
} from "@prisma/client";
import { prisma } from "../db.server";
import { isBeforeDate, isBetweenDates, sum } from "../utils";

export type CollectedFunds = Prisma.PromiseReturnType<typeof getCollectedFunds>;
export type ProjectDashboard = Prisma.PromiseReturnType<typeof getProjectDashboard>;

async function getClosedVoucherDetails(vouchers: ProjectVoucher[]) {
  const closedVouchers = vouchers.filter((v) => v.isClosed);
  const closedVoucherDetails = await prisma.projectVoucherDetail.findMany({
    where: {
      projectVoucherId: {
        in: closedVouchers.map((_) => _.id),
      },
    },
    include: {
      projectVoucher: {
        select: {
          voucherNumber: true,
          transactionDate: true,
        },
      },
    },
    orderBy: {
      projectVoucher: {
        voucherNumber: "asc",
      },
    },
  });

  return closedVoucherDetails.map((v) => {
    const { projectVoucher, ...rest } = v;
    return {
      voucher: { ...projectVoucher },
      ...rest,
    };
  });
}

async function getVoucherDetails(vouchers: ProjectVoucher[]) {
  const openVouchers = vouchers.filter((v) => !v.isClosed);
  const categories = await prisma.detailCategory.findMany();

  const closedVoucherDetails = await getClosedVoucherDetails(vouchers);

  const uncategorizedDisbursement = {
    vouchers: openVouchers,
    totalDisbursements: sum(openVouchers.map((_) => Number(_.disbursedAmount))),
  };

  const categorizedDisbursement = categories.map((c) => {
    const disbursements = closedVoucherDetails.filter((v) => v.detailCategoryId === c.id);
    return {
      category: c,
      disbursements,
      totalDisbursements: sum(disbursements.map((v) => Number(v.amount))),
    };
  });

  return {
    uncategorizedDisbursement,
    categorizedDisbursement,
  };
}

//TODO: Migrate to Prisma
async function getVoucherDetailsRaw({ id }: Pick<Project, "id">) {
  type DisbursementRawData = {
    transactionDate: Date;
    supplierName: string;
    description: string;
    referenceNumber: string;
    category: string;
    amount: Number;
    voucherNumber: string;
  };
  const rawData = await prisma.$queryRaw`
    SELECT
        pv."transactionDate",
        pvd."supplierName",
        pvd."description",
        pvd."referenceNumber",
        dc."description" AS "category",
        pvd."amount",
        pv."voucherNumber"
    FROM public."ProjectVoucherDetail" pvd
    JOIN public."ProjectVoucher" pv ON pv.id = pvd."projectVoucherId"
    JOIN public."DetailCategory" dc ON dc.id = pvd."detailCategoryId"
    WHERE pv."projectId" = ${id}
    AND pv."isDeleted" = false
    AND pv."isClosed" = true
    ORDER BY pv."transactionDate"
  `;

  return rawData as DisbursementRawData[];
}

async function getAddOnExpenses({ id }: Pick<Project, "id">) {
  const addOns = await prisma.projectAddOn.findMany({
    where: {
      projectId: id,
    },
    include: {
      updatedBy: {
        select: {
          email: true,
        },
      },
    },
  });

  return {
    addOns,
    totalAddOns: sum(addOns.map((a) => Number(a.total))),
  };
}

async function getCostPlusTotalsByProjectId({ id }: Pick<Project, "id">) {
  const vouchers = await prisma.projectVoucher.findMany({
    where: {
      isDeleted: false,
      projectId: id,
    },
  });
  const addOnExpenses = await getAddOnExpenses({ id });
  return getCostPlusTotals({ id }, vouchers, addOnExpenses.addOns);
}

async function getCostPlusTotals(
  { id }: Pick<Project, "id">,
  vouchers: ProjectVoucher[],
  addOns: ProjectAddOn[]
) {
  const targetVouchers = vouchers.filter((v) => v.costPlus);
  const settings = await prisma.projectSetting.findMany({
    where: {
      projectId: id,
    },
  });

  const getTotalsFn = (setting: ProjectSetting) => {
    let totalExempted = 0;
    const totals = sum(targetVouchers.map((v) => Number(v.consumedAmount)));
    const addOnTotals = sum(addOns.filter((a) => a.costPlus).map((a) => Number(a.total)));
    const percentage = Number(setting.percentageAddOn) / 100;

    if (setting.endDate !== null) {
      const exemptedVouchers = targetVouchers.filter(
        (v) => !isBetweenDates(setting.startDate, setting.endDate, v.transactionDate)
      );
      totalExempted = sum(exemptedVouchers.map((v) => Number(v.consumedAmount)));
    } else {
      const exemptedVouchers = targetVouchers.filter((v) =>
        isBeforeDate(setting.startDate, v.transactionDate)
      );
      totalExempted = sum(exemptedVouchers.map((v) => Number(v.consumedAmount)));
    }

    return {
      total: (addOnTotals + totals - totalExempted) * percentage,
      totalExempted,
    };
  };

  const result = settings.map((s) => {
    return {
      ...s,
      ...getTotalsFn(s),
    };
  });

  return result;
}

async function getCollectedFunds({ id }: Pick<Project, "id">) {
  const collectedFundsData = await prisma.fundTransaction.findMany({
    where: {
      projectId: id,
      type: "collection",
    },
    select: {
      amount: true,
      description: true,
      createdAt: true,
      comments: true,
    },
  });

  return collectedFundsData;
}

export async function getProjectDashboard({ id }: Pick<Project, "id">) {
  const project = await prisma.project.findFirstOrThrow({
    where: { id },
  });

  const costPlusTotalsData = await getCostPlusTotalsByProjectId({ id });
  const costPlusTotals = sum(
    costPlusTotalsData.filter((cp) => !cp.isContingency).map((cp) => cp.total)
  );
  const contingencyTotals = sum(
    costPlusTotalsData.filter((cp) => cp.isContingency).map((cp) => cp.total)
  );

  const addOnExpenses = await getAddOnExpenses({ id });
  const addOnTotals = addOnExpenses.totalAddOns;

  const vouchers = await prisma.projectVoucher.findMany({
    where: {
      isDeleted: false,
      projectId: id,
    },
  });
  const { uncategorizedDisbursement, categorizedDisbursement } = await getVoucherDetails(
    vouchers
  );
  const uncategorizedDisbursedTotal = uncategorizedDisbursement.totalDisbursements;
  const categorizedDisbursedTotal = sum(
    categorizedDisbursement.map((_) => _.totalDisbursements)
  );
  const permitsDisbursedTotal = sum(
    categorizedDisbursement
      .filter((_) => _.category.id === 4)
      .map((_) => _.totalDisbursements)
  );

  const categorizedDisbursementRaw = await getVoucherDetailsRaw({ id });
  const collectedFundsData = await getCollectedFunds({ id });

  const collectedFunds = sum(collectedFundsData.map((cf) => Number(cf.amount)));
  const disbursedFunds = categorizedDisbursedTotal + uncategorizedDisbursedTotal;
  const totalProjectCost =
    addOnTotals + disbursedFunds + costPlusTotals + contingencyTotals;
  const netProjectCost = totalProjectCost - permitsDisbursedTotal;
  const remainingFunds = Number(collectedFunds) - totalProjectCost;

  return {
    project,
    uncategorizedDisbursement,
    categorizedDisbursement,
    categorizedDisbursementRaw,
    addOnExpenses,
    costPlusTotals,
    totalProjectCost,
    costPlusTotalsData,
    remainingFunds,
    collectedFunds,
    disbursedFunds,
    addOnTotals,
    netProjectCost,
    contingencyTotals,
    collectedFundsData,
  };
}
