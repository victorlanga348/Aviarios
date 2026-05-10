import { Router } from "express";
import loginController from "../../controllers/loginController.js";
import { validate } from "../../middlewares/validate.js";
import { loginSchema } from "../../schemas/userSchema.js";

const router = Router();

router.post("/", validate(loginSchema), loginController);

export default router;