/*
  Warnings:

  - You are about to drop the column `includeInCostPlus` on the `ProjectAddOn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectAddOn" DROP COLUMN "includeInCostPlus",
ADD COLUMN     "costPlustExempt" BOOLEAN NOT NULL DEFAULT false;
