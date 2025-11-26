/*
  Warnings:

  - You are about to drop the column `voucherGroupId` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the `voucher_groups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."vouchers" DROP CONSTRAINT "vouchers_voucherGroupId_fkey";

-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "voucherGroupId",
ADD COLUMN     "group_name" TEXT,
ADD COLUMN     "voucher_name" TEXT NOT NULL DEFAULT 'empty';

-- DropTable
DROP TABLE "public"."voucher_groups";
