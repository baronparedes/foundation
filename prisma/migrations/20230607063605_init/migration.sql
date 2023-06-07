/*
  Warnings:

  - You are about to alter the column `amount` on the `FundTransaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `estimatedCost` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `amount` on the `ProjectAddOn` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `quantity` on the `ProjectAddOn` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `total` on the `ProjectAddOn` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `percentageAddOn` on the `ProjectSetting` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `disbursedAmount` on the `ProjectVoucher` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `consumedAmount` on the `ProjectVoucher` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `amount` on the `ProjectVoucherDetail` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `quantity` on the `ProjectVoucherDetail` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `disbursedAmount` on the `StudioVoucher` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `consumedAmount` on the `StudioVoucher` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `amount` on the `StudioVoucherDetail` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.
  - You are about to alter the column `quantity` on the `StudioVoucherDetail` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,6)`.

*/
-- AlterTable
ALTER TABLE "FundTransaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,6);

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "estimatedCost" SET DATA TYPE DECIMAL(65,6);

-- AlterTable
ALTER TABLE "ProjectAddOn" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,6);

-- AlterTable
ALTER TABLE "ProjectSetting" ALTER COLUMN "percentageAddOn" SET DATA TYPE DECIMAL(65,6);

-- AlterTable
ALTER TABLE "ProjectVoucher" ALTER COLUMN "disbursedAmount" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "consumedAmount" SET DATA TYPE DECIMAL(65,6);

-- AlterTable
ALTER TABLE "ProjectVoucherDetail" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,6);

-- AlterTable
ALTER TABLE "StudioVoucher" ALTER COLUMN "disbursedAmount" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "consumedAmount" SET DATA TYPE DECIMAL(65,6);

-- AlterTable
ALTER TABLE "StudioVoucherDetail" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,6),
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,6);
