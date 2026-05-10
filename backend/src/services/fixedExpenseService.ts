import prisma from "../config/db.js";

async function createFixedExpense(description: string, amount: number, date?: Date) {
    const expense = await prisma.fixedExpense.create({
        data: {
            description,
            amount,
            date: date || new Date()
        }
    });
    return expense;
}

async function listFixedExpensesByMonth(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await prisma.fixedExpense.findMany({
        where: {
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

async function deleteFixedExpense(id: string) {
    await prisma.fixedExpense.delete({
        where: { id }
    });
    return { message: "Despesa fixa removida com sucesso" };
}

export { createFixedExpense, listFixedExpensesByMonth, deleteFixedExpense };
