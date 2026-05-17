import type { Request, Response, NextFunction } from 'express';
import { getConfiguration, updateBirdSellingPrice } from '../services/configService.js';

export async function getConfigController(req: Request, res: Response, next: NextFunction) {
    try {
        const config = await getConfiguration(req.userId!);
        res.json(config);
    } catch (error: unknown) {
        next(error);
    }
}

export async function updateConfigController(req: Request, res: Response, next: NextFunction) {
    try {
        const { birdSellingPrice } = req.body as { birdSellingPrice?: number };
        if (birdSellingPrice === undefined) {
            return res.status(400).json({ error: 'Preço de venda é obrigatório' });
        }
        const config = await updateBirdSellingPrice(req.userId!, Number(birdSellingPrice));
        res.json({ message: 'Configuração atualizada com sucesso', config });
    } catch (error: unknown) {
        next(error);
    }
}
