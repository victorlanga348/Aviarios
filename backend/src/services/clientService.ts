import prisma from "../config/db.js";

async function createClient(name: string, phone: string) {
    const client = await prisma.customer.create({
        data: {
            name,
            phone
        }
    });
    return client;
}

async function listClients() {
    const clients = await prisma.customer.findMany();
    return clients;
}

export { createClient, listClients }