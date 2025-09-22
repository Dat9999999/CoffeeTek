-- CreateTable
CREATE TABLE "public"."loyalti_levels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "discount_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "min_point" INTEGER NOT NULL DEFAULT 0,
    "max_point" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,

    CONSTRAINT "loyalti_levels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loyalti_levels_name_key" ON "public"."loyalti_levels"("name");
