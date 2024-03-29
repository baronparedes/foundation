-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "estimatedCost" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundTransaction" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL DEFAULT '',
    "createdById" TEXT NOT NULL,
    "projectId" TEXT,
    "fundId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'collection',
    "comments" TEXT,

    CONSTRAINT "FundTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVoucher" (
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
    "projectId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "costPlus" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProjectVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVoucherDetail" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "supplierName" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "quantity" DECIMAL(65,30),
    "projectVoucherId" INTEGER NOT NULL,
    "detailCategoryId" INTEGER NOT NULL,

    CONSTRAINT "ProjectVoucherDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailCategory" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "DetailCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSetting" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "percentageAddOn" DECIMAL(65,30) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAddOn" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,
    "costPlus" BOOLEAN NOT NULL DEFAULT true,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectAddOn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Fund_code_key" ON "Fund"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVoucher_voucherNumber_key" ON "ProjectVoucher"("voucherNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DetailCategory_description_key" ON "DetailCategory"("description");

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundTransaction" ADD CONSTRAINT "FundTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundTransaction" ADD CONSTRAINT "FundTransaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundTransaction" ADD CONSTRAINT "FundTransaction_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVoucher" ADD CONSTRAINT "ProjectVoucher_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVoucher" ADD CONSTRAINT "ProjectVoucher_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVoucher" ADD CONSTRAINT "ProjectVoucher_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVoucherDetail" ADD CONSTRAINT "ProjectVoucherDetail_projectVoucherId_fkey" FOREIGN KEY ("projectVoucherId") REFERENCES "ProjectVoucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVoucherDetail" ADD CONSTRAINT "ProjectVoucherDetail_detailCategoryId_fkey" FOREIGN KEY ("detailCategoryId") REFERENCES "DetailCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSetting" ADD CONSTRAINT "ProjectSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSetting" ADD CONSTRAINT "ProjectSetting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAddOn" ADD CONSTRAINT "ProjectAddOn_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAddOn" ADD CONSTRAINT "ProjectAddOn_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
