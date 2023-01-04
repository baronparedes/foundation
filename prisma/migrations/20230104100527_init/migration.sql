-- CreateTable
CREATE TABLE "DetailCategory" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "DetailCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DetailCategory_description_key" ON "DetailCategory"("description");
