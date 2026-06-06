import type { NextFunction, Request, Response } from "express";
import { registerSale, deliverScheduledSale, listSales, listAllSales, listClientSales, deleteSale, getClientDebt } from "../services/saleService.js";

const registerSaleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { 
            batchId, 
            quantity, 
            customerId, 
            customerName, 
            customerPhone, 
            unitPrice, 
            amountPaid,
            isScheduled,
            scheduledDeliveryDate,
            debtDueDate
        } = req.body as {
            batchId: string;
            quantity: string;
            customerId?: string;
            customerName?: string;
            customerPhone?: string;
            unitPrice?: string;
            amountPaid?: string;
            isScheduled?: boolean;
            scheduledDeliveryDate?: string;
            debtDueDate?: string;
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
            customerPhone,
            Boolean(isScheduled),
            scheduledDeliveryDate,
            debtDueDate
        );
        res.status(201).json(sale);
    } catch (error: unknown) {
        next(error);
    }
};

const deliverScheduledSaleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const result = await deliverScheduledSale(req.userId!, id);
        res.status(200).json(result);
    } catch (error: unknown) {
        next(error);
    }
};

const deleteSaleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const result = await deleteSale(req.userId!, id);
        res.status(200).json(result);
    } catch (error: unknown) {
        next(error);
    }
};

const listSalesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const batchId = req.params.batchId as string;
        const sales = await listSales(req.userId!, batchId);
        res.status(200).json(sales);
    } catch (error: unknown) {
        next(error);
    }
};

const listAllSalesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sales = await listAllSales(req.userId!);
        res.status(200).json(sales);
    } catch (error: unknown) {
        next(error);
    }
};

const listClientSalesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId = req.params.clientId as string;
        const clientSales = await listClientSales(req.userId!, clientId);
        res.status(200).json(clientSales);
    } catch (error: unknown) {
        next(error);
    }
};

const getClientDebtController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { clientId } = req.params as { clientId: string };
        const debt = await getClientDebt(req.userId!, clientId);
        res.status(200).json(debt);
    } catch (error: unknown) {
        next(error);
    }
};

export { registerSaleController, deliverScheduledSaleController, listSalesController, listAllSalesController, listClientSalesController, deleteSaleController, getClientDebtController };
