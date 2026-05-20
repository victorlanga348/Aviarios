import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import '../types/express.js'; // ensures module augmentation is applied
import prisma from '../config/db.js';
import { checkMaintenanceStatus } from '../services/maintenanceService.js';

interface JwtPayload {
    userId: string;
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Acesso negado!" });
    
    let decodedPayload: JwtPayload;
    try {
        const cleanToken = token.split(" ")[1] || token;
        decodedPayload = jwt.verify(cleanToken, process.env.JWT_SECRET!) as JwtPayload;
        req.userId = decodedPayload.userId;
    } catch {
        return res.status(401).json({ error: "Token inválido" });
    }

    try {
        // Checar Manutenção
        const mStatus = await checkMaintenanceStatus();
        if (mStatus.inMaintenance) {
            const user = await prisma.user.findUnique({
                where: { id: req.userId }
            });
            if (!user || user.role !== 'ADMIN') {
                return res.status(503).json({ 
                    error: "SISTEMA_EM_MANUTENCAO", 
                    message: "O sistema está atualmente em manutenção para melhorias.",
                    estimatedTime: mStatus.estimatedTime
                });
            }
        }
        next();
    } catch (err) {
        next();
    }
}

export { authMiddleware };