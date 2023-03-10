/*
  Warnings:

  - You are about to drop the column `includeInCostPlus` on the `ProjectVoucher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectVoucher" DROP COLUMN "includeInCostPlus",
ADD COLUMN     "costPlus" BOOLEAN NOT NULL DEFAULT true;
