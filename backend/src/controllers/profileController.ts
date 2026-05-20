import type { Request, Response } from "express";
import prisma from "../config/db.js";
import { getErrorMessage } from "../types/express.js";

export const getProfileController = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId! },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        return res.status(200).json({ user });
    } catch (error: unknown) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
