import type { Fund } from "@prisma/client";

import {prisma} from '~/db.server';

export type { FundTransaction } from "@prisma/client";

export function getTransactionsByFundId({ id }: Pick<Fund, "id">) {
  return prisma.fundTransaction.findMany({
    where: { fundId: id },
    orderBy: { createdAt: "desc" },
  });
}
