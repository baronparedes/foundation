import type { Prisma, Project, ProjectVoucher } from "@prisma/client";
import {prisma} from '~/db.server';

import {createFundTransaction} from './fund-transaction.server';

export type { ProjectVoucher } from "@prisma/client";

export type ProjectVoucherWithDetails = Prisma.PromiseReturnType<
  typeof getProjectVouchers
>;

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
  transactionDate,
  updatedById,
  voucherNumber,
}: Omit<ProjectVoucher, "id">) {
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

  const [projectVoucher] = await prisma.$transaction([
    prisma.projectVoucher.create({
      data,
    }),
    createFundTransaction({
      amount: disbursedAmount,
      description,
      createdAt: new Date(),
      createdById: updatedById,
      fundId,
      projectId,
      comments: `Disbursed from project ${projectId}`,
      type: "disbursement",
    }),
  ]);

  return projectVoucher;
}
