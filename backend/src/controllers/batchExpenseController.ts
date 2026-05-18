import type { Request, Response } from 'express';
import { createBatchExpense, listBatchExpenses, deleteBatchExpense } from '../services/batchExpenseService.js';
import { getErrorMessage } from '../types/express.js';

async function createBatchExpenseController(req: Request, res: Response) {
    try {
        const { batchId, type, amount, description } = req.body as {
            batchId: string;
            type: string;
            amount: number;
            description?: string;
        };
        const expense = await createBatchExpense(req.userId!, batchId, type, amount, description);
        res.status(201).json(expense);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
}

async function listBatchExpensesController(req: Request, res: Response) {
    try {
        const { batchId } = req.params as { batchId: string };
        const expenses = await listBatchExpenses(req.userId!, batchId);
        res.status(200).json(expenses);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
}

async function deleteBatchExpenseController(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };
        const result = await deleteBatchExpense(req.userId!, id);
        res.status(200).json(result);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
}

export { 
    createBatchExpenseController, 
    listBatchExpensesController,
    deleteBatchExpenseController 
};
