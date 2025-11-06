-- CreateTable
CREATE TABLE "consume_sizes" (
    "id" SERIAL NOT NULL,
    "productSizeId" INTEGER NOT NULL,
    "additionalConsume" INTEGER NOT NULL,
    "materialRecipeId" INTEGER NOT NULL,

    CONSTRAINT "consume_sizes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "consume_sizes" ADD CONSTRAINT "consume_sizes_productSizeId_fkey" FOREIGN KEY ("productSizeId") REFERENCES "product_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consume_sizes" ADD CONSTRAINT "consume_sizes_materialRecipeId_fkey" FOREIGN KEY ("materialRecipeId") REFERENCES "material_recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
