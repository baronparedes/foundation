import { prisma } from "~/db.server";

import type { Fund, Prisma } from "@prisma/client";
export type { Fund } from "@prisma/client";

export type FundWithTransaction = Prisma.PromiseReturnType<typeof getFund>;
export type FundWithBalance = Pick<Fund, "id" | "name" | "code"> & {
  balance: Prisma.Decimal | number;
};

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
          comments: true,
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
          studio: {
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
    const result: FundWithBalance = {
      ...f,
      balance: fb?._sum.amount ?? 0,
    };
    return result;
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
