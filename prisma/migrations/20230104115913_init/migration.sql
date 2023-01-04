/*
  Warnings:

  - You are about to drop the column `category` on the `ProjectVoucherDetail` table. All the data in the column will be lost.
  - Added the required column `detailCategoryId` to the `ProjectVoucherDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectVoucherDetail" DROP COLUMN "category",
ADD COLUMN     "detailCategoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectVoucherDetail" ADD CONSTRAINT "ProjectVoucherDetail_detailCategoryId_fkey" FOREIGN KEY ("detailCategoryId") REFERENCES "DetailCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
