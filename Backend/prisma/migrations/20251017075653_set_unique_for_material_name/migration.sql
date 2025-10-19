/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `materials` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "materials_name_key" ON "materials"("name");
