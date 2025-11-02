/*
  Warnings:

  - You are about to drop the column `userId` on the `vouchers` table. All the data in the column will be lost.
  - Added the required column `loyalLevelId` to the `vouchers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minAmountOrder` to the `vouchers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."vouchers" DROP CONSTRAINT "vouchers_userId_fkey";

-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "userId",
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "loyalLevelId" INTEGER NOT NULL,
ADD COLUMN     "minAmountOrder" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_loyalLevelId_fkey" FOREIGN KEY ("loyalLevelId") REFERENCES "loyal_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_customerPhone_fkey" FOREIGN KEY ("customerPhone") REFERENCES "users"("phone_number") ON DELETE SET NULL ON UPDATE CASCADE;
