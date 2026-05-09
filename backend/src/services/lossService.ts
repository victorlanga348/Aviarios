import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";

async function registerLoss(batchId: string, quantity: number, reason: string) {
    return await prisma.$transaction(async (tx) => {
        const batch = await tx.batch.findUnique({
            where: {
                id: batchId
            }
        });

        if (!batch) {
            throw new Error('Batch not found');
        }

        if (batch.status === BatchStatus.CLOSED) {
            throw new Error('O lote está fechado');
        }

        const loss = await tx.loss.create({
            data: {
                batchId,
                quantity,
                reason
            }
        });

        try {
            const updatedBatch = await tx.batch.update({
                where: {
                    id: batchId,
                    actualQuantity: { gte: quantity }
                },
                data: {
                    actualQuantity: {
                        decrement: quantity
                    }
                }
            });

            // Se o lote ficou vazio, fecha ele automaticamente
            if (updatedBatch.actualQuantity === 0) {
                await tx.batch.update({
                    where: { id: batchId },
                    data: { status: BatchStatus.CLOSED }
                });
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('Record to update not found')) {
                throw new Error('Estoque insuficiente para registrar esta perda');
            }
            throw error;
        }

        return loss;
    });
}

async function listLosses(batchId: string) {
    const batch = await prisma.batch.findUnique({
        where: {
            id: batchId
        }
    });

    if (!batch) {
        throw new Error('Batch not found');
    }

    const losses = await prisma.loss.findMany({
        where: {
            batchId
        }
    });
    return losses;
}

export { registerLoss, listLosses }