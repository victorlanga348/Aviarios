import type { Request, Response, NextFunction } from "express";
import { login } from "../services/loginService.js";

async function loginController(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        const { user, token } = await login(email, password);
        res.status(200).json({ message: "Login realizado com sucesso!", user, token });
    } catch (error) {
        next(error);
    }
}

export default loginController;