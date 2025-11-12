-- DropForeignKey
ALTER TABLE "public"."order_details" DROP CONSTRAINT "order_details_order_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."order_details" ADD CONSTRAINT "order_details_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
