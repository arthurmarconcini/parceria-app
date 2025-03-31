-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "sizeId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isHalfHalf" BOOLEAN,
ALTER COLUMN "price" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Size" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HalfHalf" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "firstHalfId" TEXT NOT NULL,
    "secondHalfId" TEXT NOT NULL,

    CONSTRAINT "HalfHalf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HalfHalf_orderItemId_key" ON "HalfHalf"("orderItemId");

-- AddForeignKey
ALTER TABLE "Size" ADD CONSTRAINT "Size_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HalfHalf" ADD CONSTRAINT "HalfHalf_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HalfHalf" ADD CONSTRAINT "HalfHalf_firstHalfId_fkey" FOREIGN KEY ("firstHalfId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HalfHalf" ADD CONSTRAINT "HalfHalf_secondHalfId_fkey" FOREIGN KEY ("secondHalfId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
