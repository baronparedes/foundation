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

export async function createProjectSetting({
  description,
  percentageAddOn,
  projectId,
  startDate,
  endDate,
  updatedById,
}: Omit<ProjectSetting, "id" | "updatedAt">) {
  const data = {
    description,
    percentageAddOn,
    projectId,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    updatedById,
  };

  const projectSetting = await prisma.projectSetting.create({
    data,
  });

  return projectSetting;
}
