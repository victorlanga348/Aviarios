import prisma from "../config/db.js";
import { sanitize } from "../utils/sanitize.js";

async function createFixedExpense(userId: string, description: string, amount: number, date?: Date) {
    const expense = await prisma.fixedExpense.create({
        data: {
            description: sanitize(description),
            amount,
            date: date || new Date(),
            userId
        }
    });
    return expense;
}

async function listFixedExpensesByMonth(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await prisma.fixedExpense.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lt: endDate
            }
        },
        orderBy: {
            date: 'desc'
        }
    });

    const total = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const dailyValue = total / 30;

    return {
        expenses,
        total,
        dailyValue,
        month,
        year,
        daysInMonth: 30
    };
}

async function deleteFixedExpense(userId: string, id: string) {
    await prisma.fixedExpense.delete({
        where: { id, userId }
    });
    return { message: "Despesa fixa removida com sucesso" };
}

export { createFixedExpense, listFixedExpensesByMonth, deleteFixedExpense };
