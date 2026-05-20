import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { getProfileController } from "../../controllers/profileController.js";

const router = Router();

router.get("/me", authMiddleware, getProfileController);

export default router;
