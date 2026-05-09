-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DINHEIRO', 'TRANSFERENCIA', 'CARTAO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDENTE', 'PAGO', 'PARCIALMENTE_PAGO');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'DINHEIRO',
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDENTE';
