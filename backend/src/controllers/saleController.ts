import type { Request, Response } from "express";
import { registerSale, listSales, listAllSales, listClientSales, deleteSale, getClientDebt } from "../services/saleService.js";
import { getErrorMessage } from '../types/express.js';

const registerSaleController = async (req: Request, res: Response) => {
    try {
        const { batchId, quantity, customerId, customerName, customerPhone, unitPrice, amountPaid } = req.body as {
            batchId: string;
            quantity: string;
            customerId?: string;
            customerName?: string;
            customerPhone?: string;
            unitPrice?: string;
            amountPaid?: string;
        };

        const customerIdentifier = customerId || customerName;
        if (!customerIdentifier) {
            return res.status(400).json({ message: "Selecione um cliente ou informe o nome para um novo cadastro." });
        }

        const sale = await registerSale(
            req.userId!,
            batchId,
            Number(quantity),
            customerIdentifier,
            unitPrice ? Number(unitPrice) : undefined,
            amountPaid ? Number(amountPaid) : 0,
            customerPhone
        );
        res.status(201).json(sale);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const deleteSaleController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const result = await deleteSale(req.userId!, id);
        res.status(200).json(result);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const listSalesController = async (req: Request, res: Response) => {
    try {
        const batchId = req.params.batchId as string;
        const sales = await listSales(req.userId!, batchId);
        res.status(200).json(sales);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const listAllSalesController = async (req: Request, res: Response) => {
    try {
        const sales = await listAllSales(req.userId!);
        res.status(200).json(sales);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const listClientSalesController = async (req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId as string;
        const clientSales = await listClientSales(req.userId!, clientId);
        res.status(200).json(clientSales);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const getClientDebtController = async (req: Request, res: Response) => {
    try {
        const { clientId } = req.params as { clientId: string };
        const debt = await getClientDebt(req.userId!, clientId);
        res.status(200).json(debt);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

export { registerSaleController, listSalesController, listAllSalesController, listClientSalesController, deleteSaleController, getClientDebtController };