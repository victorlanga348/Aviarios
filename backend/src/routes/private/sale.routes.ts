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
import { validate } from "../../middlewares/validate.js";
import { batchIdParamSchema, clientIdParamSchema, idParamSchema, saleCreateSchema } from "../../schemas/domainSchemas.js";

const router = Router();
router.post("/", authMiddleware, validate(saleCreateSchema), registerSaleController);
router.post("/:id/deliver", authMiddleware, validate(idParamSchema), deliverScheduledSaleController);
router.get("/", authMiddleware, listAllSalesController);
router.get("/clients/:clientId", authMiddleware, validate(clientIdParamSchema), listClientSalesController);
router.get("/debt/:clientId", authMiddleware, validate(clientIdParamSchema), getClientDebtController);
router.get("/:batchId", authMiddleware, validate(batchIdParamSchema), listSalesController);
router.delete("/:id", authMiddleware, validate(idParamSchema), deleteSaleController);

export default router;
