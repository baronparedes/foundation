import type { Studio, StudioVoucher } from "@prisma/client";
import {prisma} from '../db.server';
import {sum} from '../utils';

async function getClosedVoucherDetails(vouchers: StudioVoucher[]) {
  const closedVouchers = vouchers.filter((v) => v.isClosed);
  const closedVoucherDetails = await prisma.studioVoucherDetail.findMany({
    where: {
      studioVoucherId: {
        in: closedVouchers.map((_) => _.id),
      },
    },
    include: {
      studioVoucher: {
        select: {
          voucherNumber: true,
          transactionDate: true,
        },
      },
    },
    orderBy: {
      studioVoucher: {
        voucherNumber: "asc",
      },
    },
  });

  return closedVoucherDetails.map((v) => {
    const { studioVoucher, ...rest } = v;
    return {
      voucher: { ...studioVoucher },
      ...rest,
    };
  });
}

async function getVoucherDetails(vouchers: StudioVoucher[]) {
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

export async function getStudioDashboard({ id }: Pick<Studio, "id">) {
  const studio = await prisma.studio.findFirstOrThrow({
    where: { id },
  });
  const vouchers = await prisma.studioVoucher.findMany({
    where: {
      isDeleted: false,
      studioId: id,
    },
  });
  const collectedFundsData = await prisma.fundTransaction.aggregate({
    _sum: {
      amount: true,
    },
  });

  const { uncategorizedDisbursement, categorizedDisbursement } = await getVoucherDetails(
    vouchers
  );

  const uncategorizedDisbursedTotal = uncategorizedDisbursement.totalDisbursements;
  const categorizedDisbursedTotal = sum(
    categorizedDisbursement.map((_) => _.totalDisbursements)
  );

  const collectedFunds = collectedFundsData._sum.amount;
  const disbursedFunds = categorizedDisbursedTotal + uncategorizedDisbursedTotal;

  const remainingFunds = Number(collectedFunds);

  return {
    studio,
    uncategorizedDisbursement,
    categorizedDisbursement,
    remainingFunds,
    disbursedFunds,
  };
}

export async function getStudioFundDetails(id: string) {
  const collectedFundsData = await prisma.fundTransaction.aggregate({
    _sum: {
      amount: true,
    },
  });

  const disbursedFundsData = await prisma.fundTransaction.aggregate({
    where: {
      studioId: id,
      type: { in: ["disbursement", "refund"] },
    },
    _sum: {
      amount: true,
    },
  });

  const remainingFunds = Number(collectedFundsData._sum.amount);
  const disbursedFunds = Number(disbursedFundsData._sum.amount);

  return {
    disbursedFunds,
    remainingFunds,
  };
}
