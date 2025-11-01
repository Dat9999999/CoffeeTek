/*
  Warnings:

  - A unique constraint covering the columns `[date,materialId]` on the table `materialRemain` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."materialRemain_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "materialRemain_date_materialId_key" ON "materialRemain"("date", "materialId");
