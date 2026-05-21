import type { Request, Response, NextFunction } from "express";
import { checkMaintenanceStatus } from "../services/maintenanceService.js";
import prisma from "../config/db.js";
import jwt from "jsonwebtoken";

/**
 * Middleware global de manutenção.
 * Bloqueia TODAS as requisições de usuários comuns quando o sistema está em manutenção.
 * Permite: rotas públicas (GET /maintenance, login, register) e requisições de ADMINs.
 */
export const maintenanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Rotas que sempre devem funcionar, mesmo em manutenção
    const allowedPaths = [
        "/api/maintenance",   // checar status de manutenção (GET) e admin update (POST)
        "/api/login",         // login sempre permitido
        "/api/register",      // registro sempre permitido
    ];

    // Se a rota é permitida, deixa passar
    const isAllowed = allowedPaths.some(path => req.path.startsWith(path));
    if (isAllowed) {
        return next();
    }

    try {
        const mStatus = await checkMaintenanceStatus();

        // Se não está em manutenção, segue normalmente
        if (!mStatus.inMaintenance) {
            return next();
        }

        // Está em manutenção — verifica se o usuário é ADMIN
        const token = req.headers.authorization;
        if (token) {
            try {
                const cleanToken = token.split(" ")[1] || token;
                const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET!) as { userId: string };
                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: { role: true }
                });

                // Admin pode continuar
                if (user?.role === "ADMIN") {
                    return next();
                }
            } catch {
                // Token inválido — cai no bloqueio abaixo
            }
        }

        // Usuário comum ou sem token → bloquear
        return res.status(503).json({
            error: "SISTEMA_EM_MANUTENCAO",
            message: "O sistema está atualmente em manutenção para melhorias.",
            estimatedTime: mStatus.estimatedTime || null,
        });

    } catch (err) {
        // Em caso de erro ao checar manutenção, não bloqueia (fail-open)
        return next();
    }
};
