import type { Request, Response, NextFunction } from 'express';
import { getBatchReport } from '../services/reportService.js';

const getBatchReportController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const month = req.query.month ? Number(req.query.month) : undefined;
        const year = req.query.year ? Number(req.query.year) : undefined;
        const report = await getBatchReport(req.userId!, month, year);
        res.status(200).json(report);
    } catch (error: unknown) {
        next(error);
    }
};

export { getBatchReportController };
