import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";

async function createBatch(userId: string, name: string, costPerBird: number, initialQuantity: number, transportCost: number, status: BatchStatus) {
    const batch = await prisma.batch.create({
        data: {
            name,
            costPerBird,
            initialQuantity,
            actualQuantity: initialQuantity,
            transportCost,
            status,
            userId
        }
    });
    return batch;
} 

async function listBatches(userId: string) {
    const batches = await prisma.batch.findMany({
        where: { userId }
    });
    return batches;
}

async function updateBatchStatus(userId: string, id: string, status: BatchStatus) {
    if (status === 'ACTIVE') {
        const existingBatch = await prisma.batch.findUnique({ where: { id, userId } });
        if (!existingBatch) {
            throw new Error("Lote não encontrado");
        }
        if (existingBatch.actualQuantity !== null && existingBatch.actualQuantity <= 0) {
            throw new Error("Não é possível ativar um lote que não possui aves.");
        }
    }

    // Scoped update
    const batch = await prisma.batch.update({
        where: { id, userId },
        data: { status }
    });
    return batch;
}

export { createBatch, listBatches, updateBatchStatus }