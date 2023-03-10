/*
  Warnings:

  - You are about to drop the column `costPlustExempt` on the `ProjectAddOn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectAddOn" DROP COLUMN "costPlustExempt",
ADD COLUMN     "costPlus" BOOLEAN NOT NULL DEFAULT true;
