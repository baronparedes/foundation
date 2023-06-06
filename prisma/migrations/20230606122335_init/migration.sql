-- AlterTable
ALTER TABLE "FundTransaction" ADD COLUMN     "studioId" TEXT;

-- CreateTable
CREATE TABLE "Studio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioVoucher" (
    "id" SERIAL NOT NULL,
    "voucherNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "disbursedAmount" DECIMAL(65,30) NOT NULL,
    "consumedAmount" DECIMAL(65,30),
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,

    CONSTRAINT "StudioVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioVoucherDetail" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "supplierName" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "quantity" DECIMAL(65,30),
    "studioVoucherId" INTEGER NOT NULL,
    "detailCategoryId" INTEGER NOT NULL,

    CONSTRAINT "StudioVoucherDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Studio_code_key" ON "Studio"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StudioVoucher_voucherNumber_key" ON "StudioVoucher"("voucherNumber");

-- AddForeignKey
ALTER TABLE "FundTransaction" ADD CONSTRAINT "FundTransaction_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioVoucher" ADD CONSTRAINT "StudioVoucher_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioVoucher" ADD CONSTRAINT "StudioVoucher_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioVoucher" ADD CONSTRAINT "StudioVoucher_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioVoucherDetail" ADD CONSTRAINT "StudioVoucherDetail_studioVoucherId_fkey" FOREIGN KEY ("studioVoucherId") REFERENCES "StudioVoucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioVoucherDetail" ADD CONSTRAINT "StudioVoucherDetail_detailCategoryId_fkey" FOREIGN KEY ("detailCategoryId") REFERENCES "DetailCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
