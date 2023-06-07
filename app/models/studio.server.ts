import type { User, Studio } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Studio } from "@prisma/client";

export function getStudio({ id }: Pick<Studio, "id">) {
  return prisma.studio.findFirst({
    where: { id },
  });
}

export function getStudiosByUserId({ userId }: { userId: User["id"] }) {
  return prisma.studio.findMany({
    // where: { userId },
    select: { id: true, name: true, code: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createStudio({
  name,
  code,
  description,
  location,
}: Omit<Studio, "createdAt" | "updatedAt" | "id">) {
  return prisma.studio.create({
    data: {
      name,
      code,
      description,
      location,
    },
  });
}
