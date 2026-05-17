import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { createBatchController, listBatchesController, updateBatchStatusController } from '../../controllers/batchController.js';

const router = Router();

router.post('/', authMiddleware, createBatchController);
router.get('/', authMiddleware, listBatchesController);
router.patch('/:id/status', authMiddleware, updateBatchStatusController);

export default router;
