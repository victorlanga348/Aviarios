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
        },
        orderBy: {
            date: 'desc'
        }
    });
    return losses;
}

async function deleteLoss(userId: string, id: string) {
    return await prisma.$transaction(async (tx) => {
        const loss = await tx.loss.findUnique({
            where: { id },
            include: {
                batch: true
            }
        });

        if (!loss) {
            throw new Error('Registro de perda não encontrado');
        }

        if (loss.batch.userId !== userId) {
            throw new Error('Acesso negado');
        }

        // Increment the batch's actual quantity
        const updatedBatch = await tx.batch.update({
            where: { id: loss.batchId },
            data: {
                actualQuantity: {
                    increment: loss.quantity
                }
            }
        });

        // Reopen batch if it was CLOSED but now has birds
        if (updatedBatch.status === 'CLOSED' && updatedBatch.actualQuantity !== null && updatedBatch.actualQuantity > 0) {
            await tx.batch.update({
                where: { id: loss.batchId },
                data: { status: BatchStatus.ACTIVE }
            });
        }

        // Delete the loss record
        await tx.loss.delete({
            where: { id }
        });

        return { success: true };
    });
}

export { registerLoss, listLosses, deleteLoss }