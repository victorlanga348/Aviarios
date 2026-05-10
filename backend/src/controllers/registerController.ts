import type { Request, Response, NextFunction } from "express";
import {registerUser} from "../services/registerService.js";

async function registerController(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password } = req.body;
        const user = await registerUser(name, email, password);
        
        
        res.status(201).json(user);

    } catch (error) {
        next(error);
    }
}

export default registerController;