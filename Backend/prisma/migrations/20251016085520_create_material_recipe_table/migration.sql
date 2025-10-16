-- CreateTable
CREATE TABLE "material_recipes" (
    "id" SERIAL NOT NULL,
    "consume" DOUBLE PRECISION NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,

    CONSTRAINT "material_recipes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "material_recipes" ADD CONSTRAINT "material_recipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_recipes" ADD CONSTRAINT "material_recipes_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
