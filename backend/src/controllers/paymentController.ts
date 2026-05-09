import type { Request, Response } from "express";
import { createPayment, listPayments } from "../services/paymentService.js";

async function createPaymentController(req: Request, res: Response) {
    const { saleId, amount, paymentType } = req.body;
    try {
        const payment = await createPayment(saleId, amount, paymentType);
        res.json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
}

async function listPaymentsController(req: Request, res: Response) {
    try {
        const payments = await listPayments();
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to list payments' });
    }
}

export { createPaymentController, listPaymentsController }