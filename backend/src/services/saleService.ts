import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";

async function registerSale(userId: string, batchId: string, quantity: number, customerIdentifier: string, unitPrice?: number, amountPaid: number = 0, customerPhone?: string) {
    return await prisma.$transaction(async (tx) => {
        const batch = await tx.batch.findUnique({
            where: { id: batchId, userId }
        });

        if (!batch) throw new Error('Lote não encontrado ou não pertence a este usuário');
        if (batch.status === BatchStatus.CLOSED) throw new Error('O lote está fechado');

        // Lógica de Cliente: Tenta buscar por ID (UUID) ou Nome (Lowercase)
        let customer;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(customerIdentifier);

        if (isUUID) {
            customer = await tx.customer.findUnique({ 
                where: { id: customerIdentifier, userId } 
            });
        } else {
            const normalizedName = customerIdentifier.trim().toLowerCase();
            customer = await tx.customer.findFirst({ 
                where: { name: normalizedName, userId } 
            });
            
            if (!customer) {
                customer = await tx.customer.create({
                    data: { 
                        name: normalizedName,
                        phone: customerPhone ?? null,
                        userId
                    }
                });
            }
        }

        if (!customer) throw new Error('Cliente não encontrado ou não pôde ser criado');

        // Se o preço unitário não foi passado, tenta usar o global
        let finalPrice = unitPrice;
        if (!finalPrice || finalPrice <= 0) {
            const config = await tx.configuration.findUnique({ where: { id: userId } });
            if (!config || config.birdSellingPrice <= 0) {
                throw new Error('Preço de venda não fornecido e preço global não configurado.');
            }
            finalPrice = config.birdSellingPrice;
        }

        const totalValue = quantity * finalPrice;
        const balance = totalValue - amountPaid;
        const status = balance <= 0 ? "PAGO" : (amountPaid > 0 ? "PARCIALMENTE_PAGO" : "PENDENTE");

        const sale = await tx.sale.create({
            data: {
                batchId,
                quantity,
                customerId: customer.id,
                unitPrice: finalPrice,
                totalValue,
                amountPaid,
                balance,
                status,
                userId
            }
        });

        // Se houve pagamento inicial, registra na tabela de pagamentos
        if (amountPaid > 0) {
            await tx.payment.create({
                data: {
                    saleId: sale.id,
                    amount: amountPaid,
                    paymentType: "DINHEIRO" // Default inicial
                }
            });
        }

        try {
            const updatedBatch = await tx.batch.update({
                where: { 
                    id: batchId,
                    userId,
                    status: BatchStatus.ACTIVE, 
                    actualQuantity: { gte: quantity } 
                },
                data: {
                    actualQuantity: { decrement: quantity }
                }
            });

            if (updatedBatch.actualQuantity === 0) {
                await tx.batch.update({
                    where: { id: batchId, userId },
                    data: { status: BatchStatus.CLOSED }
                });
            }
        } catch (error) {
            throw new Error('Não foi possível realizar a venda: Lote inexistente, fechado ou sem estoque suficiente');
        }

        return sale;
    });
}

async function deleteSale(userId: string, saleId: string) {
    return await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
            where: { id: saleId, userId }
        });

        if (!sale) throw new Error('Venda não encontrada ou não pertence a este usuário');

        await tx.payment.deleteMany({
            where: { saleId }
        });

        await tx.sale.delete({
            where: { id: saleId, userId }
        });

        await tx.batch.update({
            where: { id: sale.batchId, userId },
            data: {
                actualQuantity: { increment: sale.quantity },
                status: BatchStatus.ACTIVE
            }
        });

        return { message: "Venda deletada e estoque restaurado com sucesso" };
    });
}

async function listSales(userId: string, batchId: string) {
    const batch = await prisma.batch.findUnique({
        where: {
            id: batchId,
            userId
        }
    });

    if (!batch) {
        throw new Error('Batch not found or unauthorized');
    }

    const sales = await prisma.sale.findMany({
        where: {
            batchId,
            userId
        },
        include: {
            customer: true,
            batch: true
        }
    });
    return sales;
}

async function listAllSales(userId: string) {
    const sales = await prisma.sale.findMany({
        where: { userId },
        include: {
            customer: true,
            batch: true
        },
        orderBy: {
            date: 'desc'
        }
    });

    // Flatten to include names for easier consumption in frontend
    return sales.map(s => ({
        ...s,
        batchName: s.batch.name,
        customerName: s.customer.name
    }));
}

async function listClientSales(userId: string, clientId: string) {
    const clientWithSales = await prisma.customer.findUnique({
        where: { id: clientId, userId },
        include: {
            sales: {
                where: { userId },
                include: {
                    batch: true
                }
            }
        }
    });

    if (!clientWithSales) {
        throw new Error('Client not found or unauthorized');
    }

    return clientWithSales;
}

async function getClientDebt(userId: string, clientId: string) {
    const sales = await prisma.sale.findMany({
        where: { 
            customerId: clientId,
            userId,
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

export { registerSale, listSales, listAllSales, listClientSales, deleteSale, getClientDebt }