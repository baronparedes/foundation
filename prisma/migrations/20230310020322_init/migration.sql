-- AlterTable
ALTER TABLE "ProjectAddOn" ADD COLUMN     "includeInCostPlus" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ProjectSetting" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ProjectVoucher" ADD COLUMN     "includeInCostPlus" BOOLEAN NOT NULL DEFAULT true;
