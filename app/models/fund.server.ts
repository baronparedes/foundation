import type { Fund } from "@prisma/client";

import {prisma} from '~/db.server';

export type { Fund } from "@prisma/client";

export function getFund({ id }: Pick<Fund, "id">) {
  return prisma.fund.findFirst({
    where: { id },
  });
}

export function getFunds() {
  return prisma.fund.findMany({
    select: { id: true, name: true, code: true },
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
