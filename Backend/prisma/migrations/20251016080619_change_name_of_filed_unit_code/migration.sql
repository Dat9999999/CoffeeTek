/*
  Warnings:

  - You are about to drop the column `code` on the `units` table. All the data in the column will be lost.
  - Added the required column `symbol` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "units" DROP COLUMN "code",
ADD COLUMN     "symbol" TEXT NOT NULL;
