import prisma from "../config/db.js";

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

        const loss = await tx.loss.create({
            data: {
                batchId,
                quantity,
                reason
            }
        });

        await tx.batch.update({
            where: {
                id: batchId
            },
            data: {
                actualQuantity: {
                    decrement: quantity
                }
            }
        });

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