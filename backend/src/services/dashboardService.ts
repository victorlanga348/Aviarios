import prisma from "../config/db.js";

async function getDashboardSummary(userId: string, month?: number, year?: number) {
    const today = new Date();
    const targetMonth = month !== undefined ? month - 1 : today.getMonth();
    const targetYear = year !== undefined ? year : today.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const activeBatchesSum = await prisma.batch.aggregate({
        where: { status: 'ACTIVE', userId },
        _sum: { actualQuantity: true }
    });
    const totalLiveBirds = activeBatchesSum._sum.actualQuantity || 0;

    const totalDebtSum = await prisma.sale.aggregate({
        where: { userId },
        _sum: { balance: true }
    });
    const totalToReceive = totalDebtSum._sum.balance || 0;
    
    const paymentsMonth = await prisma.payment.aggregate({
        where: {
            sale: { userId },
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        _sum: { amount: true }
    });
    const totalCashIn = paymentsMonth._sum.amount || 0;

    const salesMonth = await prisma.sale.findMany({
        where: {
            userId,
            OR: [
                { isScheduled: false },
                { scheduledStatus: 'DELIVERED' }
            ],
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        include: {
            batch: {
                select: { 
                    costPerBird: true,
                    transportCost: true,
                    initialQuantity: true
                }
            }
        }
    });

    const totalSalesValue = salesMonth.reduce((acc, sale) => acc + sale.totalValue, 0);
    
    const costOfBirdsSold = salesMonth.reduce((acc, sale) => {
        const unitTransportCost = sale.batch.transportCost / sale.batch.initialQuantity;
        // Soma o custo da ave com seu transporte e multiplica pela quantidade vendida
        return acc + (sale.quantity * (sale.batch.costPerBird + unitTransportCost));
    }, 0);

    //Saídas de Caixa / Despesas operacionais do mês (Ração, Vacina)
    const batchExpensesMonth = await prisma.batchExpense.aggregate({
        where: {
            batch: { userId },
            createdAt: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        _sum: { amount: true }
    });
    const totalBatchExpenses = batchExpensesMonth._sum.amount || 0;

    const fixedExpensesMonth = await prisma.fixedExpense.aggregate({
        where: {
            userId,
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        _sum: { amount: true }
    });
    const totalFixedExpenses = fixedExpensesMonth._sum.amount || 0;

    //Investimento em Novos Lotes (Saída de caixa para compra de aves)
    const newBatchesMonth = await prisma.batch.findMany({
        where: {
            userId,
            startDate: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        select: {
            initialQuantity: true,
            costPerBird: true,
            transportCost: true
        }
    });

    // Soma o custo total de compra das aves e o transporte como uma saída de caixa imediata
    const totalNewBatchCost = newBatchesMonth.reduce((acc, batch) => {
        return acc + (batch.initialQuantity * batch.costPerBird) + batch.transportCost;
    }, 0);

    // Lucro Real
    const realProfit = totalSalesValue - (costOfBirdsSold + totalBatchExpenses + totalFixedExpenses);

    // Saldo de Caixa
    const cashBalance = totalCashIn - (totalBatchExpenses + totalFixedExpenses + totalNewBatchCost);

    return {
        totalLiveBirds,
        totalToReceive,
        realProfit,
        cashBalance
    };
}

export { getDashboardSummary };
