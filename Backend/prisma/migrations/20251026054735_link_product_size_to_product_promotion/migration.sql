-- AlterTable
ALTER TABLE "product_promotions" ADD COLUMN     "productSizeId" INTEGER;

-- AddForeignKey
ALTER TABLE "product_promotions" ADD CONSTRAINT "product_promotions_productSizeId_fkey" FOREIGN KEY ("productSizeId") REFERENCES "product_sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
