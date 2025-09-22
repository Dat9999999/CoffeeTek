-- CreateTable
CREATE TABLE "public"."customer_points" (
    "id" SERIAL NOT NULL,
    "total_point" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "loyaltyLevelId" INTEGER,

    CONSTRAINT "customer_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_points_userId_key" ON "public"."customer_points"("userId");

-- AddForeignKey
ALTER TABLE "public"."customer_points" ADD CONSTRAINT "customer_points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_points" ADD CONSTRAINT "customer_points_loyaltyLevelId_fkey" FOREIGN KEY ("loyaltyLevelId") REFERENCES "public"."loyalty_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
