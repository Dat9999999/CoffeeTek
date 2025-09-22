-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_multi_size" BOOLEAN NOT NULL DEFAULT false,
    "product_detail" TEXT,
    "price" DOUBLE PRECISION,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_sizes" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "product_id" INTEGER NOT NULL,
    "size_id" INTEGER NOT NULL,

    CONSTRAINT "product_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_option_values" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "option_value_id" INTEGER NOT NULL,

    CONSTRAINT "product_option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_toppings" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "topping_id" INTEGER NOT NULL,

    CONSTRAINT "product_toppings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."product_sizes" ADD CONSTRAINT "product_sizes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_sizes" ADD CONSTRAINT "product_sizes_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "public"."sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_option_values" ADD CONSTRAINT "product_option_values_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_option_values" ADD CONSTRAINT "product_option_values_option_value_id_fkey" FOREIGN KEY ("option_value_id") REFERENCES "public"."option_values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_toppings" ADD CONSTRAINT "product_toppings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_toppings" ADD CONSTRAINT "product_toppings_topping_id_fkey" FOREIGN KEY ("topping_id") REFERENCES "public"."toppings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
