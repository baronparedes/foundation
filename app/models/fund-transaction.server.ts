import type { Fund, FundTransaction } from "@prisma/client";
import { prisma } from "~/db.server";

import { Decimal } from "@prisma/client/runtime";

export type { FundTransaction } from "@prisma/client";

export type FundTransactionType = "collection" | "refund" | "disbursement" | "transfer";

export function getTransactionsByFundId({ id }: Pick<Fund, "id">) {
  return prisma.fundTransaction.findMany({
    where: { fundId: id },
    orderBy: { createdAt: "desc" },
  });
}

export async function transferFundTransaction({
  amount,
  description,
  fundId,
  createdAt,
  createdById,
  selectedFundId,
}: Omit<FundTransaction, "id" | "type" | "comments" | "projectId"> & {
  selectedFundId: string;
}) {
  prisma.$transaction([
    createFundTransaction({
      amount: new Decimal(amount),
      description,
      fundId,
      projectId: null,
      createdAt: new Date(createdAt),
      createdById,
      comments: `transfer from ${selectedFundId}`,
      type: "transfer",
    }),
    createFundTransaction({
      amount: new Decimal(Number(amount) * -1),
      description,
      fundId: selectedFundId,
      projectId: null,
      createdAt: new Date(createdAt),
      createdById,
      comments: `transfer to ${fundId}`,
      type: "transfer",
    }),
  ]);
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
  type: FundTransactionType;
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
      type: { in: ["disbursement", "refund"] },
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
