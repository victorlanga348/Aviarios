import { Router } from "express";
import { createClientController, listClientsController, listClientByName, listClientByPhone } from "../../controllers/clientController.js";

const router = Router();

router.post("/clients/create", createClientController);
router.get("/clients/list", listClientsController);
router.get("/clients/search/name/:name", listClientByName);
router.get("/clients/search/phone/:phone", listClientByPhone);

export default router;