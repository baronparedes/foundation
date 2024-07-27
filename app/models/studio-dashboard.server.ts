import type { Prisma, Studio, StudioVoucher } from "@prisma/client";
import { prisma } from "../db.server";
import { sum } from "../utils";

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

async function getStudioVouchers(
  { id }: Pick<Studio, "id">,
  params?: {
    fromDate: string | null;
    toDate: string | null;
  }
) {
  let args: Prisma.StudioVoucherFindManyArgs = {
    where: { studioId: id, isDeleted: false },
  };

  if (params) {
    if (params.fromDate && !params.toDate) {
      args = {
        where: {
          studioId: id,
          isDeleted: false,
          transactionDate: {
            gte: new Date(params.fromDate),
          },
        },
      };
    }
    if (!params.fromDate && params.toDate) {
      args = {
        where: {
          studioId: id,
          isDeleted: false,
          transactionDate: {
            lte: new Date(params.toDate),
          },
        },
      };
    }
    if (params.fromDate && params.toDate) {
      args = {
        where: {
          studioId: id,
          isDeleted: false,
          transactionDate: {
            lte: new Date(params.toDate),
            gte: new Date(params.fromDate),
          },
        },
      };
    }
  }

  const vouchers = await prisma.studioVoucher.findMany({
    ...args,
  });

  return vouchers;
}

export async function getStudioDashboard(
  { id }: Pick<Studio, "id">,
  params?: {
    fromDate: string | null;
    toDate: string | null;
  }
) {
  const studio = await prisma.studio.findFirstOrThrow({
    where: { id },
  });
  const vouchers = await getStudioVouchers({ id }, params);
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
