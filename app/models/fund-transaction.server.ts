import type { Fund, FundTransaction } from "@prisma/client";

import {prisma} from '~/db.server';

export type { FundTransaction } from "@prisma/client";

export function getTransactionsByFundId({ id }: Pick<Fund, "id">) {
  return prisma.fundTransaction.findMany({
    where: { fundId: id },
    orderBy: { createdAt: "desc" },
  });
}

export function createFundTransaction({
  amount,
  description,
  fundId,
  projectId,
  createdAt,
  createdById,
  comments,
  type,
}: Omit<FundTransaction, "id" | "type"> & {
  type: "collection" | "disbursement";
}) {
  const data = {
    amount,
    description,
    fundId,
    projectId,
    createdAt: new Date(createdAt),
    createdById,
    comments,
    type,
  };

  return prisma.fundTransaction.create({
    data,
  });
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
      type: "disbursement",
    },
    _sum: {
      amount: true,
    },
  });

  return {
    collectedFunds: collectedFundsData._sum.amount,
    disbursedFunds: disbursedFundsData._sum.amount,
  };
}
