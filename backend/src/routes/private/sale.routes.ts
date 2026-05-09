import { Router } from "express";
import { 
    registerSaleController, 
    listSalesController, 
    listClientSalesController, 
    deleteSaleController, 
    getClientDebtController 
} from "../../controllers/saleController.js";

const router = Router();
router.post("/sales/register", registerSaleController);
router.get("/sales/:batchId", listSalesController);
router.get("/sales/client/:clientId", listClientSalesController);
router.delete("/sales/cancel/:id", deleteSaleController);
router.get("/sales/debt/:clientId", getClientDebtController);

export default router;