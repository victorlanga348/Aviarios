import prisma from "../config/db.js";
import { PaymentStatus, PaymentType } from "@prisma/client";

async function createPayment(saleId: string, amount: number, paymentType: PaymentType) {
    try {
        const sale = await prisma.sale.findUnique({
            where: {
                id: saleId
            }
        });

        if (!sale) {
            throw new Error('Sale not found');
        }

        const payment = await prisma.payment.create({
            data: {
                saleId,
                amount,
                paymentType,
            }
        });

        // Updating the status of the sale
        const totalPaid = await prisma.payment.aggregate({
            where: { saleId },
            _sum: {
                amount: true
            }
        });

        if (totalPaid._sum?.amount && totalPaid._sum.amount >= sale.totalValue) {
            await prisma.sale.update({
                where: { id: saleId },
                data: {
                    status: PaymentStatus.PAGO
                }
            });
        } else {
            await prisma.sale.update({
                where: { id: saleId },
                data: {
                    status: PaymentStatus.PARCIALMENTE_PAGO,
                    amountPaid: totalPaid._sum.amount || 0,
                    balance: sale.totalValue - (totalPaid._sum.amount || 0)
                }
            });
        }

        return payment;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to create payment');
    }
}

async function listPayments() {
    try {
        const payments = await prisma.payment.findMany();
        return payments;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to list payments');
    }
}

export { createPayment, listPayments }