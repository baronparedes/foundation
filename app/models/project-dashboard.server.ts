import type { Project, ProjectAddOn, ProjectSetting, ProjectVoucher } from "@prisma/client";
import {prisma} from '../db.server';
import {isBeforeDate, isBetweenDates, sum} from '../utils';

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

  return closedVoucherDetails;
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

  const addOnExpenses = await getAddOnExpenses({ id });
  const costPlusTotals = await getCostPlusTotals({ id }, vouchers, addOnExpenses.addOns);
  const totalExempt = sum(costPlusTotals.map((_) => _.totalExempted));

  const addOnTotals = addOnExpenses.totalAddOns;
  const uncategorizedDisbursedTotal = uncategorizedDisbursement.totalDisbursements;
  const categorizedDisbursedTotal = sum(
    categorizedDisbursement.map((_) => _.totalDisbursements)
  );
  const costPlusTotal = sum(costPlusTotals.map((_) => _.total));

  const totalProjectCost =
    addOnTotals + uncategorizedDisbursedTotal + categorizedDisbursedTotal + costPlusTotal;

  const collectedFunds = collectedFundsData._sum.amount;
  const disbursedFunds = categorizedDisbursedTotal + uncategorizedDisbursedTotal;

  const remainingFunds = Number(collectedFunds) - totalProjectCost;

  return {
    project,
    uncategorizedDisbursement,
    categorizedDisbursement,
    addOnExpenses,
    costPlusTotals,
    totalProjectCost,
    totalExempt,
    remainingFunds,
    collectedFunds,
    disbursedFunds,
    addOnTotals,
  };
}

export async function getProjectFundDetails(id: string) {
  const collectedFundsData = await prisma.fundTransaction.aggregate({
    where: {
      projectId: id,
      type: "collection",
    },
    _sum: {
      amount: true,
    },
  });

  const disbursedFundsData = await prisma.fundTransaction.aggregate({
    where: {
      projectId: id,
      type: { in: ["disbursement", "refund"] },
    },
    _sum: {
      amount: true,
    },
  });

  const addOnData = await prisma.projectAddOn.aggregate({
    where: {
      projectId: id,
    },
    _sum: {
      total: true,
    },
  });

  const costPlusTotalsData = await getCostPlusTotalsByProjectId({ id });

  const costPlusTotals = sum(costPlusTotalsData.map((cp) => cp.total));
  const addOnTotals = addOnData._sum.total;
  const collectedFunds = collectedFundsData._sum.amount;
  const disbursedFunds = disbursedFundsData._sum.amount;
  const totalProjectCost =
    Number(costPlusTotals) + Number(addOnTotals) + Number(disbursedFunds) * -1;
  const remainingFunds = Number(collectedFunds) - totalProjectCost;

  return {
    collectedFunds,
    disbursedFunds,
    remainingFunds,
    addOnTotals,
    costPlusTotals,
    totalProjectCost,
  };
}
