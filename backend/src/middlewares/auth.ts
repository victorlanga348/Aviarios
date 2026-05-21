import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import '../types/express.js'; // ensures module augmentation is applied

interface JwtPayload {
    userId: string;
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Acesso negado!" });
    
    try {
        const cleanToken = token.split(" ")[1] || token;
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET!) as JwtPayload;
        
        // Verifique se o usuário ainda existe no banco de dados (caso a conta tenha sido excluída)
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        
        if (!user) {
            return res.status(401).json({ error: "A sua conta foi excluída ou desativada." });
        }
        
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido" });
    }
}

export { authMiddleware };