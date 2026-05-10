import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { getSummary } from '../../controllers/dashboardController.js';

const router = Router();

router.get('/', authMiddleware, getSummary);

export default router;
