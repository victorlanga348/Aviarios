import type { Request, Response } from 'express';
import { createBatch, listBatches } from '../services/batchService.js';

const createBatchController = async (req: Request, res: Response) => {
    try {
        const { name, costPerBird, initialQuantity, status } = req.body;
        const batch = await createBatch(name, Number(costPerBird), Number(initialQuantity), status);
        res.status(201).json(batch);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const listBatchesController = async (req: Request, res: Response) => {
    try {
        const batches = await listBatches();
        res.status(200).json(batches);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export { createBatchController, listBatchesController }