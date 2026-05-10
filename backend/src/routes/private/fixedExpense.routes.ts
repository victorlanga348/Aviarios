import { Router } from "express";
import { 
    createFixedExpenseController, 
    listFixedExpensesController, 
    deleteFixedExpenseController 
} from "../../controllers/fixedExpenseController.js";
import { authMiddleware } from "../../middlewares/auth.js";

const fixedExpenseRoutes = Router();

fixedExpenseRoutes.post("/", authMiddleware, createFixedExpenseController);
fixedExpenseRoutes.get("/", authMiddleware, listFixedExpensesController);
fixedExpenseRoutes.delete("/:id", authMiddleware, deleteFixedExpenseController);

export default fixedExpenseRoutes;
