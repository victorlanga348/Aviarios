import type { Request, Response } from 'express';
import { registerLoss, listLosses } from '../services/lossService.js';

const registerLossController = async (req: Request, res: Response) => {
    try {
        const { batchId, quantity, reason } = req.body;
        const loss = await registerLoss(batchId, Number(quantity), reason);
        res.status(201).json(loss);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const listLossesController = async (req: Request, res: Response) => {
    try {
        const { batchId } = req.params as { batchId: string };
        const losses = await listLosses(batchId);
        res.status(200).json(losses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export { registerLossController, listLossesController }