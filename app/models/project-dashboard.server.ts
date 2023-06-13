import type {
  Prisma,
  Project,
  ProjectAddOn,
  ProjectSetting,
  ProjectVoucher,
  User,
} from "@prisma/client";
import { prisma } from "../db.server";
import { isBeforeDate, isBetweenDates, sum } from "../utils";
import { getProjectsByUserId } from "./project.server";

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

export async function getProjectDashboardByUserId({ userId }: { userId: User["id"] }) {
  const projects = await getProjectsByUserId({ userId });
  const data = projects.map(async (p) => {
    const item = await getProjectDashboard({ id: p.id });
    return item as unknown as ProjectDashboard;
  });
  return data;
}

export async function getProjectDashboard({ id }: Pick<Project, "id">) {
  const project = await prisma.project.findFirstOrThrow({
    where: { id },
  });
  const vouchers = await prisma.projectVoucher.findMany({
    where: {
      isDeleted: false,
      projectId: id,
    },
  });
  const collectedFundsData = await prisma.fundTransaction.aggregate({
    where: {
      projectId: id,
      type: "collection",
    },
    _sum: {
      amount: true,
    },
  });

  const { uncategorizedDisbursement, categorizedDisbursement } = await getVoucherDetails(
    vouchers
  );

  const costPlusTotalsData = await getCostPlusTotalsByProjectId({ id });
  const costPlusTotals = sum(
    costPlusTotalsData.filter((cp) => !cp.isContingency).map((cp) => cp.total)
  );
  const contingencyTotals = sum(
    costPlusTotalsData.filter((cp) => cp.isContingency).map((cp) => cp.total)
  );

  const addOnExpenses = await getAddOnExpenses({ id });
  const addOnTotals = addOnExpenses.totalAddOns;

  const uncategorizedDisbursedTotal = uncategorizedDisbursement.totalDisbursements;
  const categorizedDisbursedTotal = sum(
    categorizedDisbursement.map((_) => _.totalDisbursements)
  );
  const permitsDisbursedTotal = sum(
    categorizedDisbursement
      .filter((_) => _.category.id === 4)
      .map((_) => _.totalDisbursements)
  );

  const collectedFunds = collectedFundsData._sum.amount;
  const disbursedFunds = categorizedDisbursedTotal + uncategorizedDisbursedTotal;
  const totalProjectCost =
    addOnTotals + disbursedFunds + costPlusTotals + contingencyTotals;
  const netProjectCost = totalProjectCost - permitsDisbursedTotal;
  const remainingFunds = Number(collectedFunds) - totalProjectCost;

  return {
    project,
    uncategorizedDisbursement,
    categorizedDisbursement,
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
  };
}
