/*
  Warnings:

  - You are about to drop the column `change` on the `inventory_adjustments` table. All the data in the column will be lost.
  - Added the required column `consume` to the `inventory_adjustments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "inventory_adjustments" DROP COLUMN "change",
ADD COLUMN     "consume" DOUBLE PRECISION NOT NULL;
