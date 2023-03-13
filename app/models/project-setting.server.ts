import { prisma } from "~/db.server";

import type { Prisma, Project, ProjectSetting } from "@prisma/client";

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

export async function deleteProjectSetting({ id }: Pick<ProjectSetting, "id">) {
  await prisma.projectSetting.delete({ where: { id } });
}
