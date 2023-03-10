import {prisma} from '~/db.server';

import type { Prisma, Project } from "@prisma/client";

export type ProjectSettingWithDetails = Prisma.PromiseReturnType<typeof getProjectSettings>;

export function getProjectSettings({ id }: Pick<Project, "id">) {
  return prisma.projectSetting.findMany({
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
