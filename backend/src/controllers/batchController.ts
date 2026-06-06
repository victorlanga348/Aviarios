import type { NextFunction, Request, Response } from 'express';
import { BatchStatus } from '@prisma/client';
import { createBatch, listBatches, updateBatchStatus, deleteBatch } from '../services/batchService.js';

const createBatchController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, costPerBird, initialQuantity, transportCost, status } = req.body as {
            name: string;
            costPerBird: string;
            initialQuantity: string;
            transportCost?: string;
            status?: BatchStatus;
        };
        const batch = await createBatch(
            req.userId!,
            name,
            Number(costPerBird),
            Number(initialQuantity),
            Number(transportCost || 0),
            status ?? 'ACTIVE'
        );
        res.status(201).json(batch);
    } catch (error: unknown) {
        next(error);
    }
};

const listBatchesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const batches = await listBatches(req.userId!);
        res.status(200).json(batches);
    } catch (error: unknown) {
        next(error);
    }
};

const updateBatchStatusController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const { status } = req.body as { status: BatchStatus };
        const batch = await updateBatchStatus(req.userId!, id, status);
        res.status(200).json(batch);
    } catch (error: unknown) {
        next(error);
    }
};

const deleteBatchController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const batch = await deleteBatch(req.userId!, id);
        res.status(200).json({ message: "Lote deletado com sucesso", batch });
    } catch (error: unknown) {
        next(error);
    }
};

export { createBatchController, listBatchesController, updateBatchStatusController, deleteBatchController };
