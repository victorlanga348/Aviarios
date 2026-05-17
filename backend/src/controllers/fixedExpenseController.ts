import type { Request, Response } from 'express';
import { createFixedExpense, listFixedExpensesByMonth, deleteFixedExpense } from '../services/fixedExpenseService.js';
import { getErrorMessage } from '../types/express.js';

const createFixedExpenseController = async (req: Request, res: Response) => {
    try {
        const { description, amount, date } = req.body as { description: string; amount: number; date?: string };
        const expense = await createFixedExpense(req.userId!, description, amount, date ? new Date(date) : undefined);
        res.status(201).json(expense);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const listFixedExpensesController = async (req: Request, res: Response) => {
    try {
        const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
        const year = parseInt(req.query.year as string) || new Date().getFullYear();
        const result = await listFixedExpensesByMonth(req.userId!, month, year);
        res.status(200).json(result);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const deleteFixedExpenseController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const result = await deleteFixedExpense(req.userId!, id);
        res.status(200).json(result);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

export { createFixedExpenseController, listFixedExpensesController, deleteFixedExpenseController };
