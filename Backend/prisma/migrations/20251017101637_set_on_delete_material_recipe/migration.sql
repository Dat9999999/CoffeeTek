-- DropForeignKey
ALTER TABLE "public"."material_recipes" DROP CONSTRAINT "material_recipes_materialId_fkey";

-- AddForeignKey
ALTER TABLE "material_recipes" ADD CONSTRAINT "material_recipes_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
