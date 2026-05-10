import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { getConfigController, updateConfigController } from '../../controllers/configController.js';

const router = Router();

router.get('/', authMiddleware, getConfigController);
router.put('/', authMiddleware, updateConfigController);

export default router;
