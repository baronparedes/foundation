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
}: Omit<FundTransaction, "id">) {
  const data = {
    amount,
    description,
    fundId,
    projectId,
    createdAt: new Date(createdAt),
    createdById,
  };

  console.log(data);

  return prisma.fundTransaction.create({
    data,
  });
}
