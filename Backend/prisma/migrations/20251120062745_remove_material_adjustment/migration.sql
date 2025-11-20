/*
  Warnings:

  - You are about to drop the `inventory_adjustments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."inventory_adjustments" DROP CONSTRAINT "inventory_adjustments_materialId_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory_adjustments" DROP CONSTRAINT "inventory_adjustments_relatedOrderId_fkey";

-- DropTable
DROP TABLE "public"."inventory_adjustments";
