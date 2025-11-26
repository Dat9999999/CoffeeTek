/*
  Warnings:

  - You are about to drop the column `group_name` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `voucher_name` on the `vouchers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "group_name",
DROP COLUMN "voucher_name",
ADD COLUMN     "voucherGroupId" INTEGER;

-- CreateTable
CREATE TABLE "voucher_groups" (
    "id" SERIAL NOT NULL,
    "group_name" TEXT NOT NULL,

    CONSTRAINT "voucher_groups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_voucherGroupId_fkey" FOREIGN KEY ("voucherGroupId") REFERENCES "voucher_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
