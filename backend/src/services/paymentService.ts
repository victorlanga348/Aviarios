import prisma from "../config/db.js";
import { PaymentStatus, PaymentType } from "@prisma/client";
import { getErrorMessage } from '../types/express.js';

async function createPayment(userId: string, saleId: string, amount: number, paymentType: PaymentType) {
    return await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
            where: { id: saleId, userId }
        });

        if (!sale) {
            throw new Error('Sale not found or unauthorized');
        }

        const payment = await tx.payment.create({
            data: {
                saleId,
                amount,
                paymentType,
            }
        });

        // Calculando total pago atualizado
        const totalPaidResult = await tx.payment.aggregate({
            where: { saleId },
            _sum: {
                amount: true
            }
        });

        // Calculando os valores finais em memória antes da atualização.
        const totalPaid = (totalPaidResult._sum?.amount || 0);
        const balance = Math.max(0, sale.totalValue - totalPaid); // Evita saldo negativo
        const status = balance === 0 ? PaymentStatus.PAGO : PaymentStatus.PARCIALMENTE_PAGO;

        await tx.sale.update({
            where: { id: saleId, userId },
            data: {
                status,
                amountPaid: totalPaid,
                balance: balance
            }
        });

        return payment;
    });
}

async function listPayments(userId: string, saleId: string) {
    try {
        const sale = await prisma.sale.findUnique({
            where: { id: saleId, userId }
        });

        if (!sale) {
            throw new Error('Sale not found or unauthorized');
        }

        const payments = await prisma.payment.findMany({
            where: { saleId }
        });
        return payments;
    } catch (error: unknown) {
        console.error(error);
        throw new Error(getErrorMessage(error));
    }
}

export { createPayment, listPayments }