import { prisma } from "~/db.server";

import type { Prisma, Project, ProjectAddOn } from "@prisma/client";

export type ProjectAddOnWithDetails = Prisma.PromiseReturnType<typeof getProjectAddOns>;

export function getProjectAddOns({ id }: Pick<Project, "id">) {
  return prisma.projectAddOn.findMany({
    where: { projectId: id },
    include: {
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

export async function deleteProjectAddOn({ id }: Pick<ProjectAddOn, "id">) {
  await prisma.projectAddOn.delete({ where: { id } });
}
