/*
  Warnings:

  - You are about to drop the column `loyalLevelId` on the `vouchers` table. All the data in the column will be lost.
  - Added the required column `requirePoint` to the `vouchers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."vouchers" DROP CONSTRAINT "vouchers_loyalLevelId_fkey";

-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "loyalLevelId",
ADD COLUMN     "requirePoint" DOUBLE PRECISION NOT NULL;
