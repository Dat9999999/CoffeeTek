-- CreateTable
CREATE TABLE "public"."orders" (
    "id" SERIAL NOT NULL,
    "note" TEXT,
    "original_price" DOUBLE PRECISION NOT NULL,
    "final_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_details" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "size_id" INTEGER,

    CONSTRAINT "order_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."order_details" ADD CONSTRAINT "order_details_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_details" ADD CONSTRAINT "order_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_details" ADD CONSTRAINT "order_details_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "public"."sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
