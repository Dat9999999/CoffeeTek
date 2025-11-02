/*
  Warnings:

  - You are about to drop the `MaterialImportation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."MaterialImportation" DROP CONSTRAINT "MaterialImportation_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MaterialImportation" DROP CONSTRAINT "MaterialImportation_materialId_fkey";

-- DropTable
DROP TABLE "public"."MaterialImportation";

-- CreateTable
CREATE TABLE "material_importations" (
    "id" SERIAL NOT NULL,
    "importQuantity" DOUBLE PRECISION NOT NULL,
    "materialId" INTEGER NOT NULL,
    "importDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "material_importations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_adjustments" (
    "id" SERIAL NOT NULL,
    "materialId" INTEGER NOT NULL,
    "change" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "relatedOrderId" INTEGER,
    "adjustedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_adjustments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "material_importations" ADD CONSTRAINT "material_importations_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_importations" ADD CONSTRAINT "material_importations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_relatedOrderId_fkey" FOREIGN KEY ("relatedOrderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
