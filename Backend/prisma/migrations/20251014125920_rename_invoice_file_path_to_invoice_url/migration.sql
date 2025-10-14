/*
  Warnings:

  - You are about to drop the column `invoiceFilePath` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "invoiceFilePath",
ADD COLUMN     "invoiceUrl" TEXT;
