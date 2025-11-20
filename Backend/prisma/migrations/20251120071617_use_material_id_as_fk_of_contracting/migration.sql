/*
  Warnings:

  - You are about to drop the column `material_remainId` on the `contractings` table. All the data in the column will be lost.
  - Added the required column `materialId` to the `contractings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."contractings" DROP CONSTRAINT "contractings_material_remainId_fkey";

-- AlterTable
ALTER TABLE "contractings" DROP COLUMN "material_remainId",
ADD COLUMN     "materialId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "contractings" ADD CONSTRAINT "contractings_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
