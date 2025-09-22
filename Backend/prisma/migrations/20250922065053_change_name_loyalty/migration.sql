/*
  Warnings:

  - You are about to drop the `loyalti_levels` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."loyalti_levels";

-- CreateTable
CREATE TABLE "public"."loyalty_levels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "discount_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "min_point" INTEGER NOT NULL DEFAULT 0,
    "max_point" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,

    CONSTRAINT "loyalty_levels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_levels_name_key" ON "public"."loyalty_levels"("name");
