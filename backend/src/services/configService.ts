import prisma from '../config/db.js';

export async function getConfiguration(userId: string) {
    let config = await prisma.configuration.findUnique({
        where: { id: userId }
    });

    if (!config) {
        config = await prisma.configuration.create({
            data: {
                id: userId,
                birdSellingPrice: 0
            }
        });
    }

    return config;
}

export async function updateBirdSellingPrice(userId: string, price: number) {
    return await prisma.configuration.upsert({
        where: { id: userId },
        update: { birdSellingPrice: price },
        create: {
            id: userId,
            birdSellingPrice: price
        }
    });
}
