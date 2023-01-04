import type { Prisma, ProjectVoucherDetail } from "@prisma/client";
import {prisma} from '../db.server';

export type ProjectVoucherDetailslWithCategory = Prisma.PromiseReturnType<
  typeof getProjectVoucherDetails
>;

export async function getProjectVoucherDetails({ id }: Pick<ProjectVoucherDetail, "id">) {
  return prisma.projectVoucherDetail.findMany({
    where: { projectVoucherId: id },
    include: {
      detailCategory: {
        select: {
          description: true,
        },
      },
    },
  });
}

export async function addProjectVoucherDetail(
  data: Omit<ProjectVoucherDetail, "id">,
  updatedById: string,
  projectVoucherId: number
) {
  await prisma.$transaction([
    prisma.projectVoucherDetail.create({
      data: {
        ...data,
        detailCategoryId: Number(data.detailCategoryId),
      },
    }),
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
