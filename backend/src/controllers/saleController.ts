import { registerSale, listSales, listClientSales, deleteSale, getClientDebt } from "../services/saleService.js";
import type { Request, Response } from "express";

const registerSaleController = async (req: Request, res: Response) => {
    try {
        const { batchId, quantity, unitPrice, customerId } = req.body;
        const sale = await registerSale(batchId, quantity, unitPrice, customerId);
        res.status(201).json(sale);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const deleteSaleController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const result = await deleteSale(id);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const listSalesController = async (req: Request, res: Response) => {
    try {
        const batchId = req.params.batchId as string;
        const sales = await listSales(batchId);
        res.status(200).json(sales);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const listClientSalesController = async (req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId as string;
        const clientSales = await listClientSales(clientId);
        res.status(200).json(clientSales);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const getClientDebtController = async (req: Request, res: Response) => {
    try {
        const { clientId } = req.params as { clientId: string };
        const debt = await getClientDebt(clientId);
        res.status(200).json(debt);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export { registerSaleController, listSalesController, listClientSalesController, deleteSaleController, getClientDebtController }