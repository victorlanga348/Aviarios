import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";

async function createBatch(name: string, costPerBird: number, initialQuantity: number, transportCost: number, status: BatchStatus) {
    const batch = await prisma.batch.create({
        data: {
            name,
            costPerBird,
            initialQuantity,
            actualQuantity: initialQuantity,
            transportCost,
            status
        }
    });
    return batch;
} 

async function listBatches() {
    const batches = await prisma.batch.findMany();
    return batches;
}

export { createBatch, listBatches }