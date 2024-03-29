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

export async function createProjectAddOn({
  description,
  amount,
  quantity,
  total,
  costPlus,
  projectId,
  updatedById,
}: Omit<ProjectAddOn, "id" | "updatedAt">) {
  const data = {
    description,
    amount,
    quantity,
    total,
    costPlus,
    projectId,
    updatedById,
  };

  const projectAddOn = await prisma.projectAddOn.create({
    data,
  });

  return projectAddOn;
}

export async function updateProjectAddOn({
  description,
  amount,
  quantity,
  total,
  costPlus,
  projectId,
  updatedById,
  id,
}: Omit<ProjectAddOn, "updatedAt">) {
  const data = {
    description,
    amount,
    quantity,
    total,
    costPlus,
    projectId,
    updatedById,
  };

  const projectAddOn = await prisma.projectAddOn.update({
    where: { id },
    data,
  });

  return projectAddOn;
}
