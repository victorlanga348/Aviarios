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

async function deleteClient(userId: string, clientId: string) {
    const client = await prisma.customer.findFirst({
        where: { id: clientId, userId },
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

    if (!client) {
        throw new Error("Cliente não encontrado ou não autorizado");
    }

    const totalDebt = client.sales.reduce((acc, sale) => acc + (sale.balance || 0), 0);
    
    if (totalDebt > 0) {
        throw new Error("Não é possível excluir um cliente com saldo devedor ativo. Registre os pagamentos pendentes antes de prosseguir.");
    }

    await prisma.$transaction(async (tx) => {
        const sales = await tx.sale.findMany({
            where: { customerId: clientId }
        });
        const saleIds = sales.map(s => s.id);

        if (saleIds.length > 0) {
            await tx.payment.deleteMany({
                where: { saleId: { in: saleIds } }
            });
            await tx.sale.deleteMany({
                where: { id: { in: saleIds } }
            });
        }

        await tx.customer.delete({
            where: { id: clientId }
        });
    });

    return { message: "Cliente excluído com sucesso" };
}

export { createClient, listClients, deleteClient }