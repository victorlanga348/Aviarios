import prisma from "../config/db.js";

async function createBatchExpense(userId: string, batchId: string, type: string, amount: number, description?: string) {
    const batch = await prisma.batch.findUnique({
        where: { id: batchId, userId }
    });

    if (!batch) {
        throw new Error('Lote não encontrado ou não pertence a este usuário');
    }

    const expense = await prisma.batchExpense.create({
        data: {
            batchId,
            type,
            amount,
            description: description ?? null
        }
    });
    return expense;
}

async function listBatchExpenses(userId: string, batchId: string) {
    const batch = await prisma.batch.findUnique({
        where: { id: batchId, userId }
    });

    if (!batch) {
        throw new Error('Lote não encontrado ou não pertence a este usuário');
    }

    return await prisma.batchExpense.findMany({
        where: { batchId }
    });
}

async function deleteBatchExpense(userId: string, expenseId: string) {
    const expense = await prisma.batchExpense.findUnique({
        where: { id: expenseId },
        include: { batch: true }
    });

    if (!expense || expense.batch.userId !== userId) {
        throw new Error('Despesa de lote não encontrada ou não autorizada');
    }

    await prisma.batchExpense.delete({
        where: { id: expenseId }
    });

    return { message: "Despesa excluída com sucesso" };
}

export { createBatchExpense, listBatchExpenses, deleteBatchExpense };
