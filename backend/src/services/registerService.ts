import prisma from "../config/db.js";
import bcrypt from "bcryptjs";

async function registerUser(name: string, email: string, password: string) {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("Este email já existe. Clique em 'Fazer login' para entrar!");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hash
        }
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}


export { registerUser }