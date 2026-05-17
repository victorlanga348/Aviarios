import prisma from "../config/db.js";

async function createClient(userId: string, name: string, phone?: string) {
    const client = await prisma.customer.create({
        data: {
            name,
            phone: phone ?? null,
            userId
        }
    });
    return client;
}

async function listClients(userId: string) {
    const clients = await prisma.customer.findMany({
        where: { userId },
        include: {
            sales: {
                where: {
                    status: { in: ['PENDENTE', 'PARCIALMENTE_PAGO'] }
                },
                select: {
                    balance: true
                }
            }
        }
    });
    
    return clients.map(client => {
        const totalDebt = client.sales.reduce((acc, sale) => acc + (sale.balance || 0), 0);
        return {
            id: client.id,
            name: client.name,
            phone: client.phone,
            userId: client.userId,
            totalDebt
        };
    });
}

export { createClient, listClients }