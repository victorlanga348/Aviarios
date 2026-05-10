import { Router } from "express";
import registerController from "../../controllers/registerController.js";
import { validate } from "../../middlewares/validate.js";
import { registerSchema } from "../../schemas/userSchema.js";

const router = Router();

router.post("/", validate(registerSchema), registerController);

export default router;