import type { Request, Response, NextFunction } from "express";
import { createPayment, listPayments } from "../services/paymentService.js";

/**
 * Controller para registrar um novo pagamento.
 */
async function createPaymentController(req: Request, res: Response, next: NextFunction) {
    const { saleId, amount, paymentType } = req.body;
    try {
        const payment = await createPayment(saleId, amount, paymentType);
        res.status(201).json(payment);
    } catch (error) {
        next(error);
    }
}

/**
 * Controller para listar pagamentos de uma venda específica.
 */
async function listPaymentsController(req: Request, res: Response, next: NextFunction) {
    const { saleId } = req.params; // Removido o 'as' que causava erro no transform
    try {
        const payments = await listPayments(String(saleId));
        res.json(payments);
    } catch (error) {
        next(error);
    }
}

export { createPaymentController, listPaymentsController }