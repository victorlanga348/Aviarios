import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { getErrorMessage } from '../types/express.js';

export const listAllUsersController = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                batches: {
                    select: { actualQuantity: true, status: true }
                },
                _count: {
                    select: { batches: true, sales: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        
        const mappedUsers = users.map(user => {
            const totalChickens = user.batches.reduce((sum, batch) => {
                if (batch.status === 'ACTIVE' && batch.actualQuantity) {
                    return sum + batch.actualQuantity;
                }
                return sum;
            }, 0);
            
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                _count: user._count,
                totalChickens
            };
        });
        
        res.status(200).json(mappedUsers);
    } catch (error) {
        console.error("Erro no Admin Controller:", error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
};

export const getAdminStatsController = async (req: Request, res: Response) => {
    try {
        const totalSalesSum = await prisma.sale.aggregate({
            _sum: { totalValue: true }
        });
        res.status(200).json({ 
            totalSalesValue: totalSalesSum._sum.totalValue || 0 
        });
    } catch (error) {
        console.error("Erro no Admin Stats:", error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
};

export const updateUserRoleController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const role = req.body.role as 'ADMIN' | 'USER';
        
        if (role !== 'ADMIN' && role !== 'USER') {
            res.status(400).json({ error: "Role inválida. Use 'ADMIN' ou 'USER'." });
            return;
        }

        // Se o novo papel for USER, verifica se o usuário é o primeiro administrador cadastrado
        if (role === 'USER') {
            const firstAdmin = await prisma.user.findFirst({
                where: { role: 'ADMIN' },
                orderBy: { createdAt: 'asc' }
            });

            if (firstAdmin && firstAdmin.id === id) {
                res.status(400).json({ error: "O primeiro administrador do sistema não pode ser destituído do cargo de ADMIN." });
                return;
            }
        }
        
        const user = await prisma.user.update({
            where: { id },
            data: { role }
        });
        
        res.status(200).json({ 
            message: "Role atualizada com sucesso.", 
            user: { id: user.id, role: user.role } 
        });
    } catch (error) {
        console.error("Erro ao atualizar Role:", error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
};
