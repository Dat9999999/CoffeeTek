-- DropForeignKey
ALTER TABLE "public"."consume_sizes" DROP CONSTRAINT "consume_sizes_materialRecipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."consume_sizes" DROP CONSTRAINT "consume_sizes_productSizeId_fkey";

-- AddForeignKey
ALTER TABLE "consume_sizes" ADD CONSTRAINT "consume_sizes_productSizeId_fkey" FOREIGN KEY ("productSizeId") REFERENCES "product_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consume_sizes" ADD CONSTRAINT "consume_sizes_materialRecipeId_fkey" FOREIGN KEY ("materialRecipeId") REFERENCES "material_recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
