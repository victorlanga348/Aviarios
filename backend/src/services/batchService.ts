import prisma from "../config/db.js";
import { BatchStatus } from "@prisma/client";

async function createBatch(name: string, costPerBird: number, initialQuantity: number, status: BatchStatus) {
    try {
        const batch = await prisma.batch.create({
            data: {
                name,
                costPerBird,
                initialQuantity,
                status
            }
        });
        return batch;
    } catch (error) {
        throw error;
    }
}

export default createBatch

async function listBatches() {
    try {
        const batches = await prisma.batch.findMany({
            where: {
                status: BatchStatus.ACTIVE
            }
        });
        return batches;
    } catch (error) {
        throw error;
    }
}

export { createBatch, listBatches }