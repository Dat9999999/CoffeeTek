/*
  Warnings:

  - You are about to drop the column `reason` on the `inventory_adjustments` table. All the data in the column will be lost.
  - You are about to drop the column `remain` on the `materials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "inventory_adjustments" DROP COLUMN "reason";

-- AlterTable
ALTER TABLE "material_importations" ADD COLUMN     "expiryDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "materials" DROP COLUMN "remain";

-- CreateTable
CREATE TABLE "materialRemain" (
    "id" SERIAL NOT NULL,
    "materialId" INTEGER NOT NULL,
    "remain" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materialRemain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watseLog" (
    "id" SERIAL NOT NULL,
    "materialId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "employeeId" INTEGER,

    CONSTRAINT "watseLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "materialRemain" ADD CONSTRAINT "materialRemain_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watseLog" ADD CONSTRAINT "watseLog_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watseLog" ADD CONSTRAINT "watseLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
