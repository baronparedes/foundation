import type { User, Project } from "@prisma/client";

import {prisma} from '~/db.server';

import {sum} from '../utils';

export type { Project } from "@prisma/client";

export function getProject({ id }: Pick<Project, "id">) {
  return prisma.project.findFirst({
    where: { id },
  });
}

export function getProjectsByUserId({ userId }: { userId: User["id"] }) {
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

export async function getProjectDashboard({ id }: Pick<Project, "id">) {
  const project = await prisma.project.findFirstOrThrow({
    where: { id },
  });
  const categories = await prisma.detailCategory.findMany();
  const vouchers = await prisma.projectVoucher.findMany({
    where: {
      isDeleted: false,
      projectId: id,
    },
    select: {
      voucherNumber: true,
      disbursedAmount: true,
      consumedAmount: true,
      id: true,
      description: true,
      transactionDate: true,
      isClosed: true,
    },
  });

  const closedVouchers = vouchers.filter((v) => v.isClosed);
  const openVouchers = vouchers.filter((v) => !v.isClosed);

  const closedVoucherDetails = await prisma.projectVoucherDetail.findMany({
    where: {
      projectVoucherId: {
        in: closedVouchers.map((_) => _.id),
      },
    },
    include: {
      projectVoucher: {
        select: {
          voucherNumber: true,
        },
      },
    },
    orderBy: {
      projectVoucher: {
        voucherNumber: "asc",
      },
    },
  });

  const uncategorizedDisbursement = {
    vouchers: openVouchers,
    totalDisbursements: sum(openVouchers.map((_) => Number(_.disbursedAmount))),
  };
  const categorizedDisbursement = categories.map((c) => {
    const disbursements = closedVoucherDetails.filter((v) => v.detailCategoryId === c.id);
    return {
      category: c,
      disbursements,
      totalDisbursements: sum(disbursements.map((v) => Number(v.amount))),
    };
  });

  //TODO: Add overheads

  return {
    project,
    uncategorizedDisbursement,
    categorizedDisbursement,
  };
}
