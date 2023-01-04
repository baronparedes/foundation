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

export function getProjectVouchers({ id }: Pick<Project, "id">) {
  return prisma.projectVoucher.findMany({
    where: { projectId: id, isDeleted: false },
    orderBy: { transactionDate: "asc" },
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
}: Omit<ProjectVoucher, "id"> & Pick<Project, "code">) {
  const data = {
    disbursedAmount,
    consumedAmount: disbursedAmount,
    description,
    fundId,
    projectId,
    updatedById,
    updatedAt: new Date(),
    transactionDate: new Date(transactionDate),
    voucherNumber,
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

  if (projectVoucher.isClosed || projectVoucher.isDeleted) {
    console.log("is deleted");
  }

  const closedConsumedAmount = await prisma.projectVoucherDetail.aggregate({
    where: { projectVoucherId },
    _sum: {
      amount: true,
    },
  });

  const refundAmount =
    Number(projectVoucher.disbursedAmount) - Number(closedConsumedAmount._sum.amount);

  const isDeleted = refundAmount === Number(projectVoucher.disbursedAmount);

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
        updatedAt: new Date(),
      },
    }),
    createFundTransaction({
      amount: new Prisma.Decimal(refundAmount),
      description: `refund from voucher ${projectVoucher.voucherNumber}`,
      createdAt: new Date(),
      createdById: updatedById,
      fundId,
      projectId: projectVoucher.projectId,
      comments: `refunded from voucher ${projectVoucher.id}`,
      type: "refund",
    }),
  ]);
}
