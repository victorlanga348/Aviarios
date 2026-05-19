import type { NextFunction, Request, Response } from "express";
import prisma from "../config/db.js";

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    
    if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({ error: "Erro ao verificar permissões." });
    }
};