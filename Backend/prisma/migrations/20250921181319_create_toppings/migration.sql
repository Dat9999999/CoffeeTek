-- CreateTable
CREATE TABLE "public"."toppings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image_name" TEXT,
    "sort_index" INTEGER NOT NULL,

    CONSTRAINT "toppings_pkey" PRIMARY KEY ("id")
);
