-- CreateTable
CREATE TABLE "public"."payment_models" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_details" (
    "id" SERIAL NOT NULL,
    "payment_model_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentcode" TEXT,
    "payment_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'completed',

    CONSTRAINT "payment_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."payment_details" ADD CONSTRAINT "payment_details_payment_model_id_fkey" FOREIGN KEY ("payment_model_id") REFERENCES "public"."payment_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_details" ADD CONSTRAINT "payment_details_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
