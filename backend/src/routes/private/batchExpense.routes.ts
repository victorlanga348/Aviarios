import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { createBatchExpenseController, listBatchExpensesController } from "../../controllers/batchExpenseController.js";

const router = Router();

router.post("/", authMiddleware, createBatchExpenseController);
router.get("/:batchId", authMiddleware, listBatchExpensesController);

export default router;
