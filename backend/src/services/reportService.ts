import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";

async function getBatchReport(userId: string, month?: number, year?: number) {
    const whereClause: Prisma.BatchWhereInput = { userId };
    
    if (month !== undefined && year !== undefined) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        
        whereClause.startDate = {
            gte: startOfMonth,
            lte: endOfMonth
        };
    }

    const batches = await prisma.batch.findMany({
        where: whereClause,
        include: {
            sales: true,
            losses: true,
            expenses: true
        },
        orderBy: {
            startDate: 'desc'
        }
    });

    return batches.map(batch => {
        const realizedSales = batch.sales.filter(s => !s.isScheduled || s.scheduledStatus === 'DELIVERED');
        const birdsSold = realizedSales.reduce((acc, s) => acc + s.quantity, 0);
        const birdsLost = batch.losses.reduce((acc, l) => acc + l.quantity, 0);
        const totalSalesValue = realizedSales.reduce((acc, s) => acc + s.totalValue, 0);
        const totalSpecificExpenses = batch.expenses.reduce((acc, e) => acc + e.amount, 0);
        
        // Cada ave vendida carrega seu custo de compra + sua parte proporcional do transporte original.

        const unitTransportCost = batch.transportCost / batch.initialQuantity;
        // unitCostTotal: O custo real de cada ave (Preço de compra + Frete unitário)
        const unitCostTotal = batch.costPerBird + unitTransportCost;
        // costOfBirdsSold: O custo total acumulado apenas das aves que já saíram (foram vendidas)
        const costOfBirdsSold = birdsSold * unitCostTotal;
        // grossProfit: Lucro Bruto (Vendas totais menos o custo de aquisição/transporte das aves vendidas)
        const grossProfit = totalSalesValue - costOfBirdsSold;
        // netProfit: Lucro Líquido (Lucro bruto menos todas as despesas de manutenção como ração/vacina)
        const netProfit = grossProfit - totalSpecificExpenses;

        return {
            id: batch.id,
            name: batch.name,
            startDate: batch.startDate,
            status: batch.status,
            inventory: {
                initial: batch.initialQuantity,
                current: batch.actualQuantity,
                sold: birdsSold,
                lost: birdsLost
            },
            financials: {
                birdPurchaseCost: batch.costPerBird,
                transportCost: batch.transportCost,
                investmentInBirds: batch.initialQuantity * batch.costPerBird,
                totalInvestment: (batch.initialQuantity * batch.costPerBird) + batch.transportCost,
                specificExpenses: totalSpecificExpenses,
                totalRevenue: totalSalesValue,
                costOfBirdsSold,
                grossProfit,
                netProfit
            }
        };
    });
}

export { getBatchReport };
