/*
  Warnings:

  - Added the required column `total` to the `ProjectAddOn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectAddOn" ADD COLUMN     "total" DECIMAL(65,30) NOT NULL;
