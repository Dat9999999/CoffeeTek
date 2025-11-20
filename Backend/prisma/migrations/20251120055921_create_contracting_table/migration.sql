-- CreateTable
CREATE TABLE "Contracting" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "empoloyeeId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contracting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contracting" ADD CONSTRAINT "Contracting_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contracting" ADD CONSTRAINT "Contracting_empoloyeeId_fkey" FOREIGN KEY ("empoloyeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
