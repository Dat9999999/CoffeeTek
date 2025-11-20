/*
  Warnings:

  - You are about to drop the `Contracting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Contracting" DROP CONSTRAINT "Contracting_empoloyeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Contracting" DROP CONSTRAINT "Contracting_material_remainId_fkey";

-- DropTable
DROP TABLE "public"."Contracting";

-- CreateTable
CREATE TABLE "contractings" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "material_remainId" INTEGER NOT NULL,
    "empoloyeeId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contractings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contractings" ADD CONSTRAINT "contractings_material_remainId_fkey" FOREIGN KEY ("material_remainId") REFERENCES "materialRemain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractings" ADD CONSTRAINT "contractings_empoloyeeId_fkey" FOREIGN KEY ("empoloyeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
