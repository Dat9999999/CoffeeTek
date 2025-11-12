/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `materialRemain` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "materialRemain_date_key" ON "materialRemain"("date");
