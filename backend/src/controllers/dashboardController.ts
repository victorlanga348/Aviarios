import type { Request, Response } from 'express';
import { getDashboardSummary } from '../services/dashboardService.js';

async function getSummary(req: Request, res: Response) {
    try {
        const summary = await getDashboardSummary();
        return res.status(200).json(summary);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

export { getSummary };
