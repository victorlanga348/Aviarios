import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { createBatchController, listBatchesController } from '../../controllers/batchController.js';

const router = Router();

router.post('/', authMiddleware, createBatchController);
router.get('/', authMiddleware, listBatchesController);

export default router;
