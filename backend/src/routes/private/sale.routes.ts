import { Router } from "express";
import { registerSaleController, listSalesController, listClientSalesController } from "../../controllers/saleController.js";

const router = Router();
router.post("/sales/register", registerSaleController);
router.get("/sales/:batchId", listSalesController);
router.get("/sales/client/:clientId", listClientSalesController);

export default router;