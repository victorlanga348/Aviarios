import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization; 
    if (!token) return res.status(401).json({ error: "Acesso negado!" });
    try {
        const cleanToken = token.split(" ")[1] || token;
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET!) as any;
        
        // CORREÇÃO: Anexar ao objeto req diretamente, não ao body
        (req as any).userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido" });
    }
}

export { authMiddleware }