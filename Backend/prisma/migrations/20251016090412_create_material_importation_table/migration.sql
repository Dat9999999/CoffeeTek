-- CreateTable
CREATE TABLE "MaterialImportation" (
    "id" SERIAL NOT NULL,
    "importQuantity" DOUBLE PRECISION NOT NULL,
    "materialId" INTEGER NOT NULL,
    "importDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "MaterialImportation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaterialImportation" ADD CONSTRAINT "MaterialImportation_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialImportation" ADD CONSTRAINT "MaterialImportation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
