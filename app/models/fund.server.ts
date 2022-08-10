import {prisma} from '~/db.server';

import type { Fund, Prisma } from "@prisma/client";

export type { Fund } from "@prisma/client";
export type FundWithTransaction = Prisma.PromiseReturnType<typeof getFund>;

export async function getFund({ id }: Pick<Fund, "id">) {
  return prisma.fund.findFirst({
    where: { id },
    include: {
      fundTransaction: {
        select: {
          id: true,
          amount: true,
          createdAt: true,
          description: true,
          createdBy: true,
          project: true,
        },
      },
    },
  });
}

export function getFunds() {
  return prisma.fund.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      fundTransaction: {
        select: {
          amount: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function createFund({
  name,
  code,
  description,
}: Omit<Fund, "createdAt" | "updatedAt" | "id">) {
  return prisma.fund.create({
    data: {
      name,
      code,
      description,
    },
  });
}
