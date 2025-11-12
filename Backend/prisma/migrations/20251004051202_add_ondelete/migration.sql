-- DropForeignKey
ALTER TABLE "public"."order_details" DROP CONSTRAINT "order_details_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."topping_order_details" DROP CONSTRAINT "topping_order_details_order_detail_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."order_details" ADD CONSTRAINT "order_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topping_order_details" ADD CONSTRAINT "topping_order_details_order_detail_id_fkey" FOREIGN KEY ("order_detail_id") REFERENCES "public"."order_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;
