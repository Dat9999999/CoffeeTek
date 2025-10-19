/*
  Warnings:

  - You are about to drop the `Material` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `unit_conversion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Material" DROP CONSTRAINT "Material_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Recipe" DROP CONSTRAINT "Recipe_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."unit_conversion" DROP CONSTRAINT "unit_conversion_from_unit_fkey";

-- DropForeignKey
ALTER TABLE "public"."unit_conversion" DROP CONSTRAINT "unit_conversion_to_unit_fkey";

-- DropTable
DROP TABLE "public"."Material";

-- DropTable
DROP TABLE "public"."Recipe";

-- DropTable
DROP TABLE "public"."unit_conversion";

-- CreateTable
CREATE TABLE "unit_conversions" (
    "id" SERIAL NOT NULL,
    "from_unit" INTEGER NOT NULL,
    "to_unit" INTEGER NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "unit_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "remain" DOUBLE PRECISION NOT NULL,
    "unitId" INTEGER NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_conversions_from_unit_to_unit_key" ON "unit_conversions"("from_unit", "to_unit");

-- AddForeignKey
ALTER TABLE "unit_conversions" ADD CONSTRAINT "unit_conversions_from_unit_fkey" FOREIGN KEY ("from_unit") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_conversions" ADD CONSTRAINT "unit_conversions_to_unit_fkey" FOREIGN KEY ("to_unit") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
