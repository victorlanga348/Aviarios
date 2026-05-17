import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import '../types/express.js'; // ensures module augmentation is applied

interface JwtPayload {
    userId: string;
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Acesso negado!" });
    try {
        const cleanToken = token.split(" ")[1] || token;
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET!) as JwtPayload;
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido" });
    }
}

export { authMiddleware };