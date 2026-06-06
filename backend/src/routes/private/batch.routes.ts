import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createBatchController, listBatchesController, updateBatchStatusController, deleteBatchController } from '../../controllers/batchController.js';
import { batchCreateSchema, batchStatusSchema, idParamSchema } from '../../schemas/domainSchemas.js';

const router = Router();

router.post('/', authMiddleware, validate(batchCreateSchema), createBatchController);
router.get('/', authMiddleware, listBatchesController);
router.patch('/:id/status', authMiddleware, validate(batchStatusSchema), updateBatchStatusController);
router.delete('/:id', authMiddleware, validate(idParamSchema), deleteBatchController);

export default router;
