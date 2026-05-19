import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { adminMiddleware } from '../../middlewares/admin.js';
import { 
    listAllUsersController, 
    getAdminStatsController, 
    updateUserRoleController 
} from '../../controllers/adminController.js';

const router = Router();

// Toda rota aqui dentro DEVE ter o "authMiddleware" e o "adminMiddleware" nessa exata ordem!
router.get('/users', authMiddleware, adminMiddleware, listAllUsersController);
router.get('/stats', authMiddleware, adminMiddleware, getAdminStatsController);
router.patch('/users/:id/role', authMiddleware, adminMiddleware, updateUserRoleController);

export default router;
