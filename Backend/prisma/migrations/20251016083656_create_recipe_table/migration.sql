/*
  Warnings:

  - A unique constraint covering the columns `[symbol]` on the table `units` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "units_symbol_key" ON "units"("symbol");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
