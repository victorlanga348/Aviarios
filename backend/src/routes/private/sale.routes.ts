import { Router } from "express";
import { 
    registerSaleController, 
    deliverScheduledSaleController,
    listSalesController, 
    listAllSalesController, 
    listClientSalesController, 
    deleteSaleController, 
    getClientDebtController 
} from "../../controllers/saleController.js";
import { authMiddleware } from "../../middlewares/auth.js";

const router = Router();
router.post("/", authMiddleware, registerSaleController);
router.post("/:id/deliver", authMiddleware, deliverScheduledSaleController);
router.get("/", authMiddleware, listAllSalesController);
router.get("/:batchId", authMiddleware, listSalesController);
router.get("/clients/:clientId", authMiddleware, listClientSalesController);
router.delete("/:id", authMiddleware, deleteSaleController);
router.get("/debt/:clientId", authMiddleware, getClientDebtController);

export default router;