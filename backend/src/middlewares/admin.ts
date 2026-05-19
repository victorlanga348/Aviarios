import type { NextFunction, Request, Response } from "express";
import type { User } from "@prisma/client";

export interface CustomRequest extends Request {
    user?: User;
}

export const adminMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || user.role !== User.ADMIN) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    next();
};