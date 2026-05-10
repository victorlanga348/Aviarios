import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { createClientController, listClientsController, listClientByName, listClientByPhone } from "../../controllers/clientController.js";

const router = Router();

router.post("/create", authMiddleware, createClientController);
router.get("/list", authMiddleware, listClientsController);
router.get("/search/name/:name", authMiddleware, listClientByName);
router.get("/search/phone/:phone", authMiddleware, listClientByPhone);

export default router;