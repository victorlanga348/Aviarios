import { Router } from "express";
import { registerLossController } from "../../controllers/lossController.js";

const router = Router();

router.post('/losses', registerLossController);

export default router;
