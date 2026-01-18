-- CreateTable
CREATE TABLE "material_consumptions" (
    "id" SERIAL NOT NULL,
    "materialId" INTEGER NOT NULL,
    "consumed" DOUBLE PRECISION NOT NULL,
    "orderId" INTEGER NOT NULL,
    "orderDetailId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "material_consumptions_materialId_date_idx" ON "material_consumptions"("materialId", "date");

-- CreateIndex
CREATE INDEX "material_consumptions_orderId_idx" ON "material_consumptions"("orderId");

-- AddForeignKey
ALTER TABLE "material_consumptions" ADD CONSTRAINT "material_consumptions_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
