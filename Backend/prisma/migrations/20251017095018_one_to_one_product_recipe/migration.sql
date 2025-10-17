/*
  Warnings:

  - A unique constraint covering the columns `[product_id]` on the table `recipes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "recipes_product_id_key" ON "recipes"("product_id");
