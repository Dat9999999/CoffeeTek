/*
  Warnings:

  - You are about to drop the column `change` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "change";

-- AlterTable
ALTER TABLE "public"."payment_details" ADD COLUMN     "change" INTEGER DEFAULT 0;
