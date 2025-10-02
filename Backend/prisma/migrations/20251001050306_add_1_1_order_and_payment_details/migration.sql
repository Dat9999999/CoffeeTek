/*
  Warnings:

  - You are about to drop the column `order_id` on the `payment_details` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentDetailId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."payment_details" DROP CONSTRAINT "payment_details_order_id_fkey";

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "paymentDetailId" INTEGER;

-- AlterTable
ALTER TABLE "public"."payment_details" DROP COLUMN "order_id";

-- CreateIndex
CREATE UNIQUE INDEX "orders_paymentDetailId_key" ON "public"."orders"("paymentDetailId");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_paymentDetailId_fkey" FOREIGN KEY ("paymentDetailId") REFERENCES "public"."payment_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;
