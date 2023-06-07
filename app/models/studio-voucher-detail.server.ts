import type { Prisma, StudioVoucher, StudioVoucherDetail } from "@prisma/client";
import { prisma } from "../db.server";

export type StudioVoucherDetailslWithCategory = Prisma.PromiseReturnType<
  typeof getStudioVoucherDetails
>;

export type StudioVoucherDetailsWithVoucherNumber = StudioVoucherDetail & {
  voucher: Pick<StudioVoucher, "voucherNumber" | "transactionDate">;
};

export async function getStudioVoucherDetails({ id }: Pick<StudioVoucherDetail, "id">) {
  return prisma.studioVoucherDetail.findMany({
    where: { studioVoucherId: id },
    include: {
      detailCategory: {
        select: {
          description: true,
        },
      },
    },
  });
}

export async function addStudioVoucherDetail(
  data: Omit<StudioVoucherDetail, "id">,
  updatedById: string,
  studioVoucherId: number
) {
  await prisma.$transaction([
    prisma.studioVoucherDetail.create({
      data: {
        ...data,
        detailCategoryId: Number(data.detailCategoryId),
      },
    }),
    prisma.studioVoucher.update({
      where: { id: studioVoucherId },
      data: { updatedById },
    }),
  ]);
}

export async function deleteStudioVoucherDetail(
  { id }: Pick<StudioVoucherDetail, "id">,
  updatedById: string,
  studioVoucherId: number
) {
  await prisma.$transaction([
    prisma.studioVoucherDetail.delete({ where: { id } }),
    prisma.studioVoucher.update({
      where: { id: studioVoucherId },
      data: { updatedById },
    }),
  ]);
}
