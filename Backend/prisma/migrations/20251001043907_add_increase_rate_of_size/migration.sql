/*
  Warnings:

  - Added the required column `increase_rate` to the `sizes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."sizes" ADD COLUMN     "increase_rate" DOUBLE PRECISION NOT NULL;
