-- DropForeignKey
ALTER TABLE "public"."product_promotions" DROP CONSTRAINT "product_promotions_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_promotions" DROP CONSTRAINT "product_promotions_promotionId_fkey";

-- AddForeignKey
ALTER TABLE "product_promotions" ADD CONSTRAINT "product_promotions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_promotions" ADD CONSTRAINT "product_promotions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
