/*
  Warnings:

  - Added the required column `actualQuantity` to the `Batch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "actualQuantity" INTEGER NOT NULL;
