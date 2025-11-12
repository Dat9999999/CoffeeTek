-- AlterTable
ALTER TABLE "product_option_values" ADD COLUMN     "orderDetailId" INTEGER;

-- CreateTable
CREATE TABLE "_OptionValueToOrderDetail" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OptionValueToOrderDetail_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OptionValueToOrderDetail_B_index" ON "_OptionValueToOrderDetail"("B");

-- AddForeignKey
ALTER TABLE "_OptionValueToOrderDetail" ADD CONSTRAINT "_OptionValueToOrderDetail_A_fkey" FOREIGN KEY ("A") REFERENCES "option_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OptionValueToOrderDetail" ADD CONSTRAINT "_OptionValueToOrderDetail_B_fkey" FOREIGN KEY ("B") REFERENCES "order_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;
