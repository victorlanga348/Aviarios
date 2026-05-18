import prisma from "../config/db.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";

async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error("Este email não está cadastrado. Clique em 'Cadastre-se agora' para se cadastrar!");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Senha incorreta!");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
}

export { login }