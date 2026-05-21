-- CreateEnum
CREATE TYPE "ScheduledStatus" AS ENUM ('PENDING', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "debtDueDate" TIMESTAMP(3),
ADD COLUMN     "isScheduled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduledDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "scheduledStatus" "ScheduledStatus";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "estimatedTime" TEXT,
    "scheduledStart" TIMESTAMP(3),
    "durationHours" DOUBLE PRECISION,
    "leadTimeHours" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);
