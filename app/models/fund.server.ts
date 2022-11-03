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
          createdBy: {
            select: {
              id: true,
              email: true,
            },
          },
          project: {
            select: {
              code: true,
              description: true,
              id: true,
            },
          },
        },
      },
    },
  });
}

export async function getFunds() {
  const fundBalance = await prisma.fundTransaction.groupBy({
    by: ["fundId"],
    _sum: {
      amount: true,
    },
  });

  const funds = await prisma.fund.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return funds.map((f) => {
    const fb = fundBalance.find((fb) => fb.fundId === f.id);
    return {
      ...f,
      balance: fb?._sum.amount ?? 0,
    };
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
