/*
  Warnings:

  - You are about to drop the `toppings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."product_toppings" DROP CONSTRAINT "product_toppings_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_toppings" DROP CONSTRAINT "product_toppings_topping_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."topping_order_details" DROP CONSTRAINT "topping_order_details_topping_id_fkey";

-- DropTable
DROP TABLE "public"."toppings";

-- AddForeignKey
ALTER TABLE "product_toppings" ADD CONSTRAINT "product_toppings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_toppings" ADD CONSTRAINT "product_toppings_topping_id_fkey" FOREIGN KEY ("topping_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topping_order_details" ADD CONSTRAINT "topping_order_details_topping_id_fkey" FOREIGN KEY ("topping_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
