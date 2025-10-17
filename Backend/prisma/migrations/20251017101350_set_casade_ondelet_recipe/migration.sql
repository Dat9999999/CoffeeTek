-- DropForeignKey
ALTER TABLE "public"."recipes" DROP CONSTRAINT "recipes_product_id_fkey";

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
