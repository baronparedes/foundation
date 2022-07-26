import {prisma} from '~/db.server';

import {Prisma, Project, ProjectVoucher} from '@prisma/client';

import {createFundTransaction} from './fund-transaction.server';

export type { ProjectVoucher } from "@prisma/client";

export type ProjectVoucherWithDetails = Prisma.PromiseReturnType<
  typeof getProjectVouchers
>;

export function getProjectVoucher({ id }: Pick<ProjectVoucher, "id">) {
  return prisma.projectVoucher.findFirst({ where: { id } });
}

export function getProjectVouchers({ id }: Pick<Project, "id">) {
  return prisma.projectVoucher.findMany({
    where: { projectId: id },
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
      comments: `Disbursed to project ${code}`,
      type: "disbursement",
    }),
  ]);

  return projectVoucher;
}
