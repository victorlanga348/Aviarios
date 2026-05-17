import type { Request, Response, NextFunction } from 'express';
import { getDashboardSummary } from '../services/dashboardService.js';

async function getSummary(req: Request, res: Response, next: NextFunction) {
    try {
        const month = req.query.month ? Number(req.query.month) : undefined;
        const year = req.query.year ? Number(req.query.year) : undefined;
        const summary = await getDashboardSummary(req.userId!, month, year);
        return res.status(200).json(summary);
    } catch (error: unknown) {
        next(error);
    }
}

export { getSummary };
