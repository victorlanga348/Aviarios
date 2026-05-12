import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { getBatchReportController } from '../../controllers/reportController.js';

const router = Router();

router.get('/', authMiddleware, getBatchReportController);

export default router;
