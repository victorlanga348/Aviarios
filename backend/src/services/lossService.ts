import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";

async function registerLoss(userId: string, batchId: string, quantity: number, reason?: string) {
    return await prisma.$transaction(async (tx) => {
        const batch = await tx.batch.findUnique({
            where: {
                id: batchId,
                userId
            }
        });

        if (!batch) {
            throw new Error('Lote não encontrado ou não pertence a este usuário');
        }

        if (batch.status === BatchStatus.CLOSED) {
            throw new Error('O lote está fechado');
        }

        const loss = await tx.loss.create({
            data: {
                batchId,
                quantity,
                reason: reason ?? null
            }
        });

        try {
            const updatedBatch = await tx.batch.update({
                where: {
                    id: batchId,
                    userId,
                    status: BatchStatus.ACTIVE,
                    actualQuantity: { gte: quantity }
                },
                data: {
                    actualQuantity: {
                        decrement: quantity
                    }
                }
            });

            if (updatedBatch.actualQuantity === 0) {
                await tx.batch.update({
                    where: { id: batchId, userId },
                    data: { status: BatchStatus.CLOSED }
                });
            }
        } catch (error) {
            throw new Error('Não foi possível registrar a perda: Lote inexistente, fechado ou sem estoque suficiente');
        }

        return loss;
    });
}

async function listLosses(userId: string, batchId: string) {
    const batch = await prisma.batch.findUnique({
        where: {
            id: batchId,
            userId
        }
    });

    if (!batch) {
        throw new Error('Lote não encontrado ou não pertence a este usuário');
    }

    const losses = await prisma.loss.findMany({
        where: {
            batchId
        }
    });
    return losses;
}

export { registerLoss, listLosses }