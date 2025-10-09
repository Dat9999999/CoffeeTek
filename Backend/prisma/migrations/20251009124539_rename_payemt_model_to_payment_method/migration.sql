/*
  Warnings:

  - You are about to drop the column `payment_model_id` on the `payment_details` table. All the data in the column will be lost.
  - Added the required column `payment_method_id` to the `payment_details` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."payment_details" DROP CONSTRAINT "payment_details_payment_model_id_fkey";

-- AlterTable
ALTER TABLE "public"."payment_details" DROP COLUMN "payment_model_id",
ADD COLUMN     "payment_method_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."payment_details" ADD CONSTRAINT "payment_details_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
