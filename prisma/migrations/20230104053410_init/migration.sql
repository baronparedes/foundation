/*
  Warnings:

  - Made the column `isClosed` on table `ProjectVoucher` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDeleted` on table `ProjectVoucher` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProjectVoucher" ALTER COLUMN "isClosed" SET NOT NULL,
ALTER COLUMN "isClosed" SET DEFAULT false,
ALTER COLUMN "isDeleted" SET NOT NULL,
ALTER COLUMN "isDeleted" SET DEFAULT false;
