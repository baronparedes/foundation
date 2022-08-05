import type { User, Project } from "@prisma/client";

import {prisma} from '~/db.server';

export type { Project } from "@prisma/client";

export function getProject({ id }: Pick<Project, "id">) {
  return prisma.project.findFirst({
    where: { id },
  });
}

export function getProjectsByUserId({ userId }: { userId: User["id"] }) {
  console.log(userId);
  return prisma.project.findMany({
    // where: { userId },
    select: { id: true, name: true, code: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createProject({
  name,
  code,
  description,
  location,
  estimatedCost,
}: Omit<Project, "createdAt" | "updatedAt" | "id">) {
  return prisma.project.create({
    data: {
      name,
      code,
      description,
      location,
      estimatedCost,
    },
  });
}
