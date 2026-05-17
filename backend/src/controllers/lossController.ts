import type { Request, Response } from 'express';
import { registerLoss, listLosses } from '../services/lossService.js';
import { getErrorMessage } from '../types/express.js';

const registerLossController = async (req: Request, res: Response) => {
    try {
        const { batchId, quantity, reason } = req.body as { batchId: string; quantity: string; reason?: string };
        const loss = await registerLoss(req.userId!, batchId, Number(quantity), reason);
        res.status(201).json(loss);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const listLossesController = async (req: Request, res: Response) => {
    try {
        const { batchId } = req.params as { batchId: string };
        const losses = await listLosses(req.userId!, batchId);
        res.status(200).json(losses);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

export { registerLossController, listLossesController };