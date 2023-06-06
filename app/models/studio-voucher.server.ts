import {prisma} from '~/db.server';

import {Prisma} from '@prisma/client';

import {createFundTransaction} from './fund-transaction.server';

import type { Studio, StudioVoucher } from "@prisma/client";
export type { StudioVoucher, StudioVoucherDetail } from "@prisma/client";

export type StudioVoucherWithDetails = Prisma.PromiseReturnType<typeof getStudioVouchers>;

export function getStudioVoucher({ id }: Pick<StudioVoucher, "id">) {
  return prisma.studioVoucher.findFirst({
    where: { id },
  });
}

export function getStudioVouchers({
  id,
  criteria,
}: Pick<Studio, "id"> & { criteria?: string }) {
  let args: Prisma.StudioVoucherFindManyArgs = {
    where: { studioId: id, isDeleted: false },
  };

  if (criteria) {
    args = {
      where: {
        AND: [
          { studioId: id, isDeleted: false },
          {
            OR: [
              {
                voucherNumber: {
                  contains: criteria,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: criteria,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
    };
  }

  return prisma.studioVoucher.findMany({
    ...args,
    orderBy: { createdAt: "desc" },
    include: {
      fund: {
        select: {
          code: true,
        },
      },
      updatedBy: {
        select: {
          email: true,
        },
      },
      studio: {
        select: {
          code: true,
        },
      },
    },
  });
}

export async function createStudioVoucher({
  disbursedAmount,
  description,
  fundId,
  studioId,
  code,
  transactionDate,
  updatedById,
  voucherNumber,
}: Omit<StudioVoucher, "id"> & Pick<Studio, "code">) {
  const data = {
    disbursedAmount,
    consumedAmount: disbursedAmount,
    description,
    fundId,
    studioId,
    updatedById,
    transactionDate: new Date(transactionDate),
    voucherNumber: voucherNumber.toUpperCase(),
  };

  const amt = parseFloat(disbursedAmount.toString()) * -1;
  const [studioVoucher] = await prisma.$transaction([
    prisma.studioVoucher.create({
      data,
    }),
    createFundTransaction({
      amount: new Prisma.Decimal(amt),
      description,
      createdAt: new Date(),
      createdById: updatedById,
      fundId,
      projectId: null,
      studioId,
      comments: `disbursed to studio ${code}`,
      type: "disbursement",
    }),
  ]);

  return studioVoucher;
}

export async function closeStudioVoucher(
  studioVoucherId: number,
  fundId: string,
  updatedById: string
) {
  const studioVoucher = await prisma.studioVoucher.findFirstOrThrow({
    where: {
      id: studioVoucherId,
      OR: [{ isClosed: { not: true } }, { isDeleted: { not: true } }],
    },
  });

  const closedConsumedAmount = await prisma.studioVoucherDetail.aggregate({
    where: { studioVoucherId },
    _sum: {
      amount: true,
    },
  });

  const refundAmount =
    Number(studioVoucher.disbursedAmount) - Number(closedConsumedAmount._sum.amount);

  const isDeleted = refundAmount === Number(studioVoucher.disbursedAmount);
  const deletedDesc = `deleted voucher ${studioVoucher.voucherNumber}`;
  const closedDesc = `refund from voucher ${studioVoucher.voucherNumber}`;

  if (refundAmount === 0) {
    await prisma.studioVoucher.update({
      where: {
        id: studioVoucherId,
      },
      data: {
        consumedAmount: closedConsumedAmount._sum.amount,
        isClosed: true,
        isDeleted,
        updatedById,
      },
    });
    return;
  }

  await prisma.$transaction([
    prisma.studioVoucher.update({
      where: {
        id: studioVoucherId,
      },
      data: {
        consumedAmount: closedConsumedAmount._sum.amount,
        isClosed: true,
        isDeleted,
        updatedById,
      },
    }),
    createFundTransaction({
      amount: new Prisma.Decimal(refundAmount),
      description: isDeleted ? deletedDesc : closedDesc,
      comments: isDeleted ? deletedDesc : closedDesc,
      createdAt: new Date(),
      createdById: updatedById,
      fundId,
      projectId: null,
      studioId: studioVoucher.studioId,
      type: "refund",
    }),
  ]);
}
