/*
  Warnings:

  - You are about to drop the `consume_sizes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sizeId` to the `material_recipes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."consume_sizes" DROP CONSTRAINT "consume_sizes_materialRecipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."consume_sizes" DROP CONSTRAINT "consume_sizes_productSizeId_fkey";

-- AlterTable
ALTER TABLE "material_recipes" ADD COLUMN     "sizeId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."consume_sizes";

-- AddForeignKey
ALTER TABLE "material_recipes" ADD CONSTRAINT "material_recipes_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
