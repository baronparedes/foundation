-- AlterTable
ALTER TABLE "ProjectVoucher" ADD COLUMN "isDeleted" BOOLEAN;

-- CreateTable
CREATE TABLE "ProjectVoucherDetail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "supplierName" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "quantity" DECIMAL,
    "projectVoucherId" INTEGER NOT NULL,
    CONSTRAINT "ProjectVoucherDetail_projectVoucherId_fkey" FOREIGN KEY ("projectVoucherId") REFERENCES "ProjectVoucher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
