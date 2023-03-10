import {prisma} from '~/db.server';

import type { Prisma, Project } from "@prisma/client";

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
