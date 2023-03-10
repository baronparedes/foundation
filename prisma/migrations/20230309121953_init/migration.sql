/*
  Warnings:

  - You are about to drop the column `categoryExclusions` on the `ProjectSetting` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `ProjectSetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `ProjectSetting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectSetting" DROP COLUMN "categoryExclusions",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProjectVoucher" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "ProjectSetting" ADD CONSTRAINT "ProjectSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
