/*
  Warnings:

  - You are about to drop the column `balance` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "balance";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;
