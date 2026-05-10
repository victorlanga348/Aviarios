import prisma from "../config/db.js";

// Calcula o resumo geral para o Dashboard.
// Retorna aves vivas, total de dívidas e lucro do mês atual.
async function getDashboardSummary() {
    const today = new Date();
    // Definindo o intervalo do mês atual
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Total de aves vivas hoje (Soma de todos os lotes ativos)
    const activeBatchesSum = await prisma.batch.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { actualQuantity: true }
    });
    const totalLiveBirds = activeBatchesSum._sum.actualQuantity || 0;

    // 2. Total de dívidas a receber (Soma total de saldos de todas as vendas pendentes)
    const totalDebtSum = await prisma.sale.aggregate({
        _sum: { balance: true }
    });
    const totalToReceive = totalDebtSum._sum.balance || 0;

    // 3. Entradas de Caixa (Pagamentos recebidos no mês)
    const paymentsMonth = await prisma.payment.aggregate({
        where: {
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        _sum: { amount: true }
    });
    const totalCashIn = paymentsMonth._sum.amount || 0;

    // 4. Vendas Realizadas (Valor total dos compromissos de venda do mês)
    const salesMonth = await prisma.sale.findMany({
        where: {
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        include: {
            batch: {
                select: { costPerBird: true }
            }
        }
    });

    const totalSalesValue = salesMonth.reduce((acc, sale) => acc + sale.totalValue, 0);
    
    // CMV: Custo da Mercadoria Vendida (Custo de compra das aves vendidas)
    const costOfBirdsSold = salesMonth.reduce((acc, sale) => {
        return acc + (sale.quantity * sale.batch.costPerBird);
    }, 0);

    // 5. Saídas de Caixa / Despesas operacionais do mês (Ração, Vacina)
    const batchExpensesMonth = await prisma.batchExpense.aggregate({
        where: {
            createdAt: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        _sum: { amount: true }
    });
    const totalBatchExpenses = batchExpensesMonth._sum.amount || 0;

    // 6. Saídas de Caixa / Despesas Fixas (Luz, Água)
    const fixedExpensesMonth = await prisma.fixedExpense.aggregate({
        where: {
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        _sum: { amount: true }
    });
    const totalFixedExpenses = fixedExpensesMonth._sum.amount || 0;

    // 7. Investimento em Novos Lotes (Saída de caixa para compra de aves)
    const newBatchesMonth = await prisma.batch.findMany({
        where: {
            startDate: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        select: {
            initialQuantity: true,
            costPerBird: true
        }
    });

    const totalNewBatchCost = newBatchesMonth.reduce((acc, batch) => {
        return acc + (batch.initialQuantity * batch.costPerBird);
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