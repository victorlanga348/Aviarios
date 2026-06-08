-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDENTE', 'AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- AlterTable
ALTER TABLE "Maintenance"
ADD COLUMN "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'Sistema',
ADD COLUMN "clientName" TEXT,
ADD COLUMN "equipment" TEXT,
ADD COLUMN "description" TEXT;
