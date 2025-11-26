-- AlterTable
ALTER TABLE "vouchers" ADD COLUMN     "group_name" TEXT,
ADD COLUMN     "voucher_name" TEXT NOT NULL DEFAULT 'empty';
