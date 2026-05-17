/*
  Warnings:

  - Added the required column `userId` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `FixedExpense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BatchExpense" DROP CONSTRAINT "BatchExpense_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Loss" DROP CONSTRAINT "Loss_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_saleId_fkey";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "transportCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FixedExpense" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL,
    "birdSellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Batch_userId_idx" ON "Batch"("userId");

-- CreateIndex
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "FixedExpense_userId_idx" ON "FixedExpense"("userId");

-- CreateIndex
CREATE INDEX "Sale_userId_idx" ON "Sale"("userId");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchExpense" ADD CONSTRAINT "BatchExpense_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loss" ADD CONSTRAINT "Loss_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedExpense" ADD CONSTRAINT "FixedExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Configuration" ADD CONSTRAINT "Configuration_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
