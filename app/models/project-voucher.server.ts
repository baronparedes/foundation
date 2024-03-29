import { prisma } from "~/db.server";

import { Prisma } from "@prisma/client";

import { createFundTransaction } from "./fund-transaction.server";

import type { Project, ProjectVoucher } from "@prisma/client";
export type { ProjectVoucher, ProjectVoucherDetail } from "@prisma/client";

export type ProjectVoucherWithDetails = Prisma.PromiseReturnType<typeof getProjectVouchers>;

export function getProjectVoucher({ id }: Pick<ProjectVoucher, "id">) {
  return prisma.projectVoucher.findFirst({
    where: { id },
  });
}

export function getProjectVouchers({
  id,
  criteria,
}: Pick<Project, "id"> & { criteria?: string }) {
  let args: Prisma.ProjectVoucherFindManyArgs = {
    where: { projectId: id, isDeleted: false },
  };

  if (criteria) {
    args = {
      where: {
        AND: [
          { projectId: id, isDeleted: false },
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

  return prisma.projectVoucher.findMany({
    ...args,
    orderBy: { transactionDate: "desc" },
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
      project: {
        select: {
          code: true,
        },
      },
    },
  });
}

export async function createProjectVoucher({
  disbursedAmount,
  description,
  fundId,
  projectId,
  code,
  transactionDate,
  updatedById,
  voucherNumber,
  costPlus,
}: Omit<ProjectVoucher, "id"> & Pick<Project, "code">) {
  const data = {
    disbursedAmount,
    consumedAmount: disbursedAmount,
    description,
    fundId,
    projectId,
    updatedById,
    transactionDate: new Date(transactionDate),
    voucherNumber: voucherNumber.toUpperCase(),
    costPlus,
  };

  const amt = parseFloat(disbursedAmount.toString()) * -1;
  const [projectVoucher] = await prisma.$transaction([
    prisma.projectVoucher.create({
      data,
    }),
    createFundTransaction({
      amount: new Prisma.Decimal(amt),
      description,
      createdAt: new Date(),
      createdById: updatedById,
      fundId,
      projectId,
      studioId: null,
      comments: `disbursed to project ${code}`,
      type: "disbursement",
    }),
  ]);

  return projectVoucher;
}

export async function closeProjectVoucher(
  projectVoucherId: number,
  fundId: string,
  updatedById: string
) {
  const projectVoucher = await prisma.projectVoucher.findFirstOrThrow({
    where: {
      id: projectVoucherId,
      OR: [{ isClosed: { not: true } }, { isDeleted: { not: true } }],
    },
  });

  const closedConsumedAmount = await prisma.projectVoucherDetail.aggregate({
    where: { projectVoucherId },
    _sum: {
      amount: true,
    },
  });

  const refundAmount =
    Number(projectVoucher.disbursedAmount) - Number(closedConsumedAmount._sum.amount);

  const isDeleted = refundAmount === Number(projectVoucher.disbursedAmount);
  const deletedDesc = `deleted voucher ${projectVoucher.voucherNumber}`;
  const closedDesc = `refund from voucher ${projectVoucher.voucherNumber}`;

  if (refundAmount === 0) {
    await prisma.projectVoucher.update({
      where: {
        id: projectVoucherId,
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
    prisma.projectVoucher.update({
      where: {
        id: projectVoucherId,
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
      projectId: projectVoucher.projectId,
      studioId: null,
      type: "refund",
    }),
  ]);
}

export async function reopenProjectVoucher(projectVoucherId: number, updatedById: string) {
  const projectVoucher = await prisma.projectVoucher.findFirstOrThrow({
    where: { id: projectVoucherId, isClosed: true, isDeleted: false },
  });

  const closedConsumedAmount = await prisma.projectVoucherDetail.aggregate({
    where: { projectVoucherId },
    _sum: {
      amount: true,
    },
  });

  const refundAmount =
    Number(projectVoucher.disbursedAmount) - Number(closedConsumedAmount._sum.amount);

  const desc = `refund reversal from voucher ${projectVoucher.voucherNumber}`;

  if (refundAmount === 0) {
    await prisma.projectVoucher.update({
      where: {
        id: projectVoucherId,
      },
      data: {
        consumedAmount: projectVoucher.disbursedAmount, //revert value
        isClosed: false,
        isDeleted: false,
        updatedById,
      },
    });
    return;
  }

  await prisma.$transaction([
    prisma.projectVoucher.update({
      where: {
        id: projectVoucherId,
      },
      data: {
        consumedAmount: projectVoucher.disbursedAmount, //revert value
        isClosed: false,
        isDeleted: false,
        updatedById,
      },
    }),
    createFundTransaction({
      amount: new Prisma.Decimal(refundAmount * -1),
      description: desc,
      comments: desc,
      createdAt: new Date(),
      createdById: updatedById,
      fundId: projectVoucher.fundId,
      projectId: projectVoucher.projectId,
      studioId: null,
      type: "disbursement",
    }),
  ]);
}

export async function toggleCostPlus(
  projectVoucherId: number,
  updatedById: string,
  costPlus: boolean
) {
  await prisma.projectVoucher.update({
    where: {
      id: projectVoucherId,
    },
    data: {
      updatedById,
      costPlus,
    },
  });
}
