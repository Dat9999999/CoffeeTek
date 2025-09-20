/*
  Warnings:

  - You are about to drop the column `email` on the `user_details` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."user_details_email_key";

-- AlterTable
ALTER TABLE "public"."user_details" DROP COLUMN "email";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");
