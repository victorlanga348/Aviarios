import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { createBatchController, listBatchesController, updateBatchStatusController, deleteBatchController } from '../../controllers/batchController.js';

const router = Router();

router.post('/', authMiddleware, createBatchController);
router.get('/', authMiddleware, listBatchesController);
router.patch('/:id/status', authMiddleware, updateBatchStatusController);
router.delete('/:id', authMiddleware, deleteBatchController);

export default router;
