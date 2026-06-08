import bcrypt from "bcryptjs";
import prisma from "../config/db.js";

const DEFAULT_ADMIN_EMAIL = "victorlanga720@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "manolashe";

export async function ensureDefaultAdmin() {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);

    await prisma.user.upsert({
        where: { email: DEFAULT_ADMIN_EMAIL },
        update: {
            role: "ADMIN",
        },
        create: {
            name: "Victor Langa",
            email: DEFAULT_ADMIN_EMAIL,
            password: passwordHash,
            role: "ADMIN",
        },
    });
}
