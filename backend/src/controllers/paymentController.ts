import type { Request, Response, NextFunction } from "express";
import { PaymentType } from "@prisma/client";
import { createPayment, listPayments } from "../services/paymentService.js";

/**
 * Controller para registrar um novo pagamento.
 */
async function createPaymentController(req: Request, res: Response, next: NextFunction) {
    const { saleId, amount, paymentType } = req.body as { saleId: string; amount: number; paymentType: PaymentType };
    try {
        const payment = await createPayment(req.userId!, saleId, amount, paymentType);
        res.status(201).json(payment);
    } catch (error: unknown) {
        next(error);
    }
}

/**
 * Controller para listar pagamentos de uma venda específica.
 */
async function listPaymentsController(req: Request, res: Response, next: NextFunction) {
    const { saleId } = req.params as { saleId: string };
    try {
        const payments = await listPayments(req.userId!, saleId);
        res.json(payments);
    } catch (error: unknown) {
        next(error);
    }
}

export { createPaymentController, listPaymentsController };