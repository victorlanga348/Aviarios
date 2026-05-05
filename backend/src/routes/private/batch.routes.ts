import { Router } from 'express';
import { createBatchController, listBatchesController } from '../../controllers/batchController.js';

const router = Router();

router.post('/batches', createBatchController);
router.get('/batches', listBatchesController);

export default router;
