import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";

async function registerSale(batchId: string, quantity: number, unitPrice: number, customerId: string) {
    // Utilizamos o $transaction para garantir que ambas as operações (criar venda e atualizar estoque)
    // aconteçam juntas de forma segura. Se ocorrer um erro em qualquer uma, o banco desfaz as duas (Rollback).
    return await prisma.$transaction(async (tx) => {
        const batch = await tx.batch.findUnique({
            where: {
                id: batchId
            }
        });

        if (!batch) {
            throw new Error('Batch not found');
        }

        if ((batch.actualQuantity || 0) < quantity) {
            throw new Error('Not enough quantity');
        }

        if (batch.status === BatchStatus.CLOSED) {
            throw new Error('Batch is closed');
        }

        const totalValue = quantity * unitPrice;

        const sale = await tx.sale.create({
            data: {
                batchId,
                quantity,
                customerId,
                unitPrice,
                totalValue,
            }
        });

        // Usamos decrement para reduzir a quantidade atomicamente.
        // Isso evita "condições de corrida" onde múltiplas vendas simultâneas
        // poderiam ler o mesmo estoque antigo e corromper a quantidade.
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

        return sale;
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

export { registerSale, listSales, listClientSales }