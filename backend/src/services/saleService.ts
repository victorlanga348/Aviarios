import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";

async function registerSale(batchId: string, quantity: number, unitPrice: number, customerId: string) {
    return await prisma.$transaction(async (tx) => {
        // 1. Verificar se o lote existe e está ativo
        const batch = await tx.batch.findUnique({
            where: { id: batchId }
        });

        if (!batch) throw new Error('Lote não encontrado');
        if (batch.status === BatchStatus.CLOSED) throw new Error('O lote está fechado');

        const totalValue = quantity * unitPrice;

        // 2. Criar a venda
        const sale = await tx.sale.create({
            data: {
                batchId,
                quantity,
                customerId,
                unitPrice,
                totalValue,
                balance: totalValue, // Inicialmente a dívida é o valor total
                status: "PENDENTE"
            }
        });

        // 3. Atualizar estoque com verificação de segurança (não permite ficar negativo)
        // O Prisma retornará um erro se o 'where' não encontrar o registro (ou seja, se a quantidade for insuficiente)
        try {
            const updatedBatch = await tx.batch.update({
                where: { 
                    id: batchId,
                    actualQuantity: { gte: quantity } // Só atualiza se houver estoque suficiente
                },
                data: {
                    actualQuantity: { decrement: quantity }
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
                 throw new Error('Estoque insuficiente para realizar esta venda');
            }
            throw error;
        }

        return sale;
    });
}

async function deleteSale(saleId: string) {
    return await prisma.$transaction(async (tx) => {
        // 1. Buscar a venda para saber a quantidade e o lote
        const sale = await tx.sale.findUnique({
            where: { id: saleId }
        });

        if (!sale) throw new Error('Venda não encontrada');

        // 2. Deletar pagamentos associados primeiro (devido às relações no banco)
        await tx.payment.deleteMany({
            where: { saleId }
        });

        // 3. Deletar a venda
        await tx.sale.delete({
            where: { id: saleId }
        });

        // 4. Devolver os frangos ao estoque do lote e reabrir se necessário
        await tx.batch.update({
            where: { id: sale.batchId },
            data: {
                actualQuantity: { increment: sale.quantity },
                status: BatchStatus.ACTIVE
            }
        });

        return { message: "Venda deletada e estoque restaurado com sucesso" };
    });
}

async function listSales(batchId: string) {
    // Não precisamos de try/catch aqui, o express controller cuidará de interceptar qualquer erro
    const batch = await prisma.batch.findUnique({
        where: {
            id: batchId
        }
    });

    if (!batch) {
        throw new Error('Batch not found');
    }

    const sales = await prisma.sale.findMany({
        where: {
            batchId
        }
    });
    return sales;
}

async function listClientSales(clientId: string) {
    // Busca o cliente e já inclui as vendas associadas a ele.
    // Isso reduz as idas ao banco de dados de 2 para apenas 1 (evita overhead).
    const clientWithSales = await prisma.customer.findUnique({
        where: { id: clientId },
        include: {
            sales: {
                // Aqui trazemos as informações do lote também, caso necessário na interface
                include: {
                    batch: true
                }
            }
        }
    });

    if (!clientWithSales) {
        throw new Error('Client not found');
    }

    return clientWithSales;
}

async function getClientDebt(clientId: string) {
    const sales = await prisma.sale.findMany({
        where: { 
            customerId: clientId,
            status: { in: ['PENDENTE', 'PARCIALMENTE_PAGO'] }
        },
        select: {
            balance: true
        }
    });

    const totalDebt = sales.reduce((acc, sale) => acc + (sale.balance || 0), 0);
    
    return {
        clientId,
        totalDebt
    };
}

export { registerSale, listSales, listClientSales, deleteSale, getClientDebt }