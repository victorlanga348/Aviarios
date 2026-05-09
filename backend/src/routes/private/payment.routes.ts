import { Router } from "express";
import { createPaymentController, listPaymentsController } from "../../controllers/paymentController.js";

const router = Router();

router.post('/payment', createPaymentController);
router.get('/payment', listPaymentsController);

export default router;