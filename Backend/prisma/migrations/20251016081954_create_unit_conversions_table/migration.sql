-- CreateTable
CREATE TABLE "unit_conversion" (
    "id" SERIAL NOT NULL,
    "from_unit" INTEGER NOT NULL,
    "to_unit" INTEGER NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "unit_conversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_conversion_from_unit_to_unit_key" ON "unit_conversion"("from_unit", "to_unit");

-- AddForeignKey
ALTER TABLE "unit_conversion" ADD CONSTRAINT "unit_conversion_from_unit_fkey" FOREIGN KEY ("from_unit") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_conversion" ADD CONSTRAINT "unit_conversion_to_unit_fkey" FOREIGN KEY ("to_unit") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
