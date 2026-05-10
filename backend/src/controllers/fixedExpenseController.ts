import type { Request, Response } from 'express';
import { createFixedExpense, listFixedExpensesByMonth, deleteFixedExpense } from '../services/fixedExpenseService.js';

const createFixedExpenseController = async (req: Request, res: Response) => {
    try {
        const { description, amount, date } = req.body;
        const expense = await createFixedExpense(description, amount, date ? new Date(date) : undefined);
        res.status(201).json(expense);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const listFixedExpensesController = async (req: Request, res: Response) => {
    try {
        const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
        const year = parseInt(req.query.year as string) || new Date().getFullYear();
        
        const result = await listFixedExpensesByMonth(month, year);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const deleteFixedExpenseController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as {id: string};
        const result = await deleteFixedExpense(id);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export { createFixedExpenseController, listFixedExpensesController, deleteFixedExpenseController };
