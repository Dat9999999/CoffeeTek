-- DropForeignKey
ALTER TABLE "public"."customer_points" DROP CONSTRAINT "customer_points_customerPhone_fkey";

-- AlterTable
ALTER TABLE "customer_points" ALTER COLUMN "customerPhone" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "customer_points" ADD CONSTRAINT "customer_points_customerPhone_fkey" FOREIGN KEY ("customerPhone") REFERENCES "users"("phone_number") ON DELETE RESTRICT ON UPDATE CASCADE;
