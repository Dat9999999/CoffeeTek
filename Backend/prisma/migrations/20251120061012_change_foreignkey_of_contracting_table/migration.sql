/*
  Warnings:

  - You are about to drop the column `materialId` on the `Contracting` table. All the data in the column will be lost.
  - Added the required column `material_remainId` to the `Contracting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Contracting" DROP CONSTRAINT "Contracting_materialId_fkey";

-- AlterTable
ALTER TABLE "Contracting" DROP COLUMN "materialId",
ADD COLUMN     "material_remainId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Contracting" ADD CONSTRAINT "Contracting_material_remainId_fkey" FOREIGN KEY ("material_remainId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
