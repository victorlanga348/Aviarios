import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { 
    createBatchExpenseController, 
    listBatchExpensesController,
    deleteBatchExpenseController 
} from "../../controllers/batchExpenseController.js";

const router = Router();

router.post("/", authMiddleware, createBatchExpenseController);
router.get("/:batchId", authMiddleware, listBatchExpensesController);
router.delete("/:id", authMiddleware, deleteBatchExpenseController);

export default router;
