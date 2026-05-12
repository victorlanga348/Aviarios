import type { Request, Response } from 'express';
import { getBatchReport } from '../services/reportService.js';

const getBatchReportController = async (req: Request, res: Response) => {
    try {
        const report = await getBatchReport();
        res.status(200).json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export { getBatchReportController };
