-- DropForeignKey
ALTER TABLE "public"."topping_order_details" DROP CONSTRAINT "topping_order_details_topping_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."topping_order_details" ADD CONSTRAINT "topping_order_details_topping_id_fkey" FOREIGN KEY ("topping_id") REFERENCES "public"."toppings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
