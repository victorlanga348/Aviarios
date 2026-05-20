import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { getErrorMessage } from '../types/express.js';

export const listAllUsersController = async (req: Request, res: Response) => {
    try {
        const firstAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            orderBy: { createdAt: 'asc' }
        });

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
                totalChickens,
                isFirstAdmin: firstAdmin ? (user.id === firstAdmin.id) : false
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

export const deleteUserController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        const firstAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            orderBy: { createdAt: 'asc' }
        });

        if (firstAdmin && firstAdmin.id === id) {
            res.status(400).json({ error: "O primeiro administrador (Dono) não pode ser removido do sistema." });
            return;
        }

        await prisma.user.delete({
            where: { id }
        });
        
        res.status(200).json({ message: "Conta removida com sucesso." });
    } catch (error) {
        console.error("Erro ao apagar conta:", error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
};

export const transferOwnershipController = async (req: Request, res: Response) => {
    try {
        const newOwnerId = req.params.id as string;
        
        const firstAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            orderBy: { createdAt: 'asc' }
        });

        if (!firstAdmin) {
            res.status(400).json({ error: "Dono atual não encontrado." });
            return;
        }

        const newOwner = await prisma.user.findUnique({
            where: { id: newOwnerId }
        });

        if (!newOwner) {
            res.status(404).json({ error: "Nova conta não encontrada." });
            return;
        }

        if (firstAdmin.id === newOwnerId) {
            res.status(400).json({ error: "Você já é o Dono do sistema." });
            return;
        }

        // Alteramos a data de criação do novo dono para 1 segundo antes do dono atual.
        // Isso fará com que a query `orderBy: { createdAt: 'asc' }` o escolha.
        const olderDate = new Date(firstAdmin.createdAt.getTime() - 1000);
        
        await prisma.$transaction([
            prisma.user.update({
                where: { id: newOwnerId },
                data: { createdAt: olderDate, role: 'ADMIN' }
            }),
            prisma.user.update({
                where: { id: firstAdmin.id },
                data: { createdAt: new Date() }
            })
        ]);

        res.status(200).json({ message: "Posse transferida com sucesso. Você não é mais o Dono." });
    } catch (error) {
        console.error("Erro ao transferir posse:", error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
};
