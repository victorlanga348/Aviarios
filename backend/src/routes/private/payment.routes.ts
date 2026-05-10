import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { createPaymentController, listPaymentsController } from "../../controllers/paymentController.js";

const router = Router();

router.post('/', authMiddleware, createPaymentController);
router.get('/:saleId', authMiddleware, listPaymentsController);

export default router;