-- CreateTable
CREATE TABLE "ProjectSetting" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "percentageAddOn" DECIMAL(65,30) NOT NULL,
    "categoryExclusions" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectSetting" ADD CONSTRAINT "ProjectSetting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
