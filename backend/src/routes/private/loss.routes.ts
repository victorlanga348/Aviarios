import { Router } from "express";
import { registerLossController, listLossesController, deleteLossController } from "../../controllers/lossController.js";
import { authMiddleware } from "../../middlewares/auth.js";

const router = Router();

router.post('/', authMiddleware, registerLossController);
router.get('/:batchId', authMiddleware, listLossesController);
router.delete('/:id', authMiddleware, deleteLossController);

export default router;
