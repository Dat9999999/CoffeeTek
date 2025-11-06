-- DropForeignKey
ALTER TABLE "public"."material_recipes" DROP CONSTRAINT "material_recipes_recipeId_fkey";

-- AddForeignKey
ALTER TABLE "material_recipes" ADD CONSTRAINT "material_recipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
