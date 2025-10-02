-- CreateTable
CREATE TABLE "public"."topping_order_details" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "order_detail_id" INTEGER NOT NULL,
    "topping_id" INTEGER NOT NULL,

    CONSTRAINT "topping_order_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."topping_order_details" ADD CONSTRAINT "topping_order_details_order_detail_id_fkey" FOREIGN KEY ("order_detail_id") REFERENCES "public"."order_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topping_order_details" ADD CONSTRAINT "topping_order_details_topping_id_fkey" FOREIGN KEY ("topping_id") REFERENCES "public"."toppings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
