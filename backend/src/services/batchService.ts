import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";
import { badRequest, notFound } from "../utils/httpError.js";

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
        where: { userId },
        include: {
            losses: true
        }
    });
    return batches;
}

async function updateBatchStatus(userId: string, id: string, status: BatchStatus) {
    if (status === 'ACTIVE') {
        const existingBatch = await prisma.batch.findUnique({ where: { id, userId } });
        if (!existingBatch) {
            throw notFound("Lote não encontrado");
        }
        if (existingBatch.actualQuantity !== null && existingBatch.actualQuantity <= 0) {
            throw badRequest("Não é possível ativar um lote que não possui aves.");
        }
    }

    // Scoped update
    const batch = await prisma.batch.update({
        where: { id, userId },
        data: { status }
    });
    return batch;
}

async function deleteBatch(userId: string, id: string) {
    return await prisma.$transaction(async (tx) => {
        await tx.loss.deleteMany({ where: { batchId: id } });
        await tx.batchExpense.deleteMany({ where: { batchId: id } });
        
        const sales = await tx.sale.findMany({
            where: { batchId: id }
        });
        const saleIds = sales.map(s => s.id);
        
        if (saleIds.length > 0) {
            await tx.payment.deleteMany({
                where: { saleId: { in: saleIds } }
            });
            await tx.sale.deleteMany({
                where: { id: { in: saleIds } }
            });
        }
        
        const deleted = await tx.batch.delete({
            where: { id, userId }
        });
        return deleted;
    });
}

export { createBatch, listBatches, updateBatchStatus, deleteBatch }
