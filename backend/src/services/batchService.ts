import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";

async function createBatch(name: string, costPerBird: number, initialQuantity: number, status: BatchStatus) {
    const batch = await prisma.batch.create({
        data: {
            name,
            costPerBird,
            initialQuantity,
            actualQuantity: initialQuantity,
            status
        }
    });
    return batch;
}

async function listBatches() {
    const batches = await prisma.batch.findMany({
        where: {
            status: BatchStatus.ACTIVE
        }
    });
    return batches;
}

export { createBatch, listBatches }