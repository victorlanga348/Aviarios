import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";

async function registerSale(batchId: string, quantity: number, customerId: string) {
    return await prisma.$transaction(async (tx) => {
        const batch = await tx.batch.findUnique({
            where: { id: batchId }
        });

        if (!batch) throw new Error('Lote não encontrado');
        if (batch.status === BatchStatus.CLOSED) throw new Error('O lote está fechado');

        const config = await tx.configuration.findUnique({
            where: { id: 'global' }
        });

        if (!config || config.birdSellingPrice <= 0) {
            throw new Error('Preço de venda universal não configurado. Por favor, configure o preço primeiro.');
        }

        const finalPrice = config.birdSellingPrice;

        const totalValue = quantity * finalPrice;

        const sale = await tx.sale.create({
            data: {
                batchId,
                quantity,
                customerId,
                unitPrice: finalPrice,
                totalValue,
                balance: totalValue, 
                status: "PENDENTE"
            }
        });

        try {
            const updatedBatch = await tx.batch.update({
                where: { 
                    id: batchId,
                    status: BatchStatus.ACTIVE, 
                    actualQuantity: { gte: quantity } 
                },
                data: {
                    actualQuantity: { decrement: quantity }
                }
            });

            if (updatedBatch.actualQuantity === 0) {
                await tx.batch.update({
                    where: { id: batchId },
                    data: { status: BatchStatus.CLOSED }
                });
            }
        } catch (error) {
            throw new Error('Não foi possível realizar a venda: Lote inexistente, fechado ou sem estoque suficiente');
        }

        return sale;
    });
}

async function deleteSale(saleId: string) {
    return await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
            where: { id: saleId }
        });

        if (!sale) throw new Error('Venda não encontrada');

        await tx.payment.deleteMany({
            where: { saleId }
        });

        await tx.sale.delete({
            where: { id: saleId }
        });

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
    const clientWithSales = await prisma.customer.findUnique({
        where: { id: clientId },
        include: {
            sales: {
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