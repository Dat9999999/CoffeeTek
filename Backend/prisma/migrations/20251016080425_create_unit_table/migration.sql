-- CreateTable
CREATE TABLE "units" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "class" TEXT NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);
