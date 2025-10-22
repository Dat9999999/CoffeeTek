/*
  Warnings:

  - You are about to drop the column `promotionId` on the `vouchers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."vouchers" DROP CONSTRAINT "vouchers_promotionId_fkey";

-- AlterTable
ALTER TABLE "product_promotions" ADD COLUMN     "new_price" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "promotionId",
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
