import type { ProjectVoucherDetail } from "@prisma/client";
import {prisma} from '../db.server';

export async function getProjectVoucherDetails({ id }: Pick<ProjectVoucherDetail, "id">) {
  return prisma.projectVoucherDetail.findMany({
    where: { projectVoucherId: id },
  });
}

export async function addProjectVoucherDetail(
  data: Omit<ProjectVoucherDetail, "id">,
  updatedById: string,
  projectVoucherId: number
) {
  await prisma.$transaction([
    prisma.projectVoucherDetail.create({ data }),
    prisma.projectVoucher.update({
      where: { id: projectVoucherId },
      data: { updatedById, updatedAt: new Date() },
    }),
  ]);
}

export async function deleteProjectVoucherDetail(
  { id }: Pick<ProjectVoucherDetail, "id">,
  updatedById: string,
  projectVoucherId: number
) {
  await prisma.$transaction([
    prisma.projectVoucherDetail.delete({ where: { id } }),
    prisma.projectVoucher.update({
      where: { id: projectVoucherId },
      data: { updatedById, updatedAt: new Date() },
    }),
  ]);
}
