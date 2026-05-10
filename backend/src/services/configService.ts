import prisma from '../config/db.js';

export async function getConfiguration() {
    let config = await prisma.configuration.findUnique({
        where: { id: 'global' }
    });

    if (!config) {
        config = await prisma.configuration.create({
            data: {
                id: 'global',
                birdSellingPrice: 0
            }
        });
    }

    return config;
}

export async function updateBirdSellingPrice(price: number) {
    return await prisma.configuration.upsert({
        where: { id: 'global' },
        update: { birdSellingPrice: price },
        create: {
            id: 'global',
            birdSellingPrice: price
        }
    });
}
