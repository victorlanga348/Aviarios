import { Router } from "express";
import { registerLossController, listLossesController } from "../../controllers/lossController.js";
import { authMiddleware } from "../../middlewares/auth.js";

const router = Router();

router.post('/', authMiddleware, registerLossController);
router.get('/:batchId', authMiddleware, listLossesController);

export default router;
