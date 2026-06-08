import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'] as const;

for (const key of requiredEnvVars) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

const parsePort = (value: string | undefined) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 3333;
};

const parseCorsOrigins = (value: string | undefined) => {
    if (!value) return [];
    return value
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);
};

export const env = {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    PORT: parsePort(process.env.PORT),
    CORS_ORIGINS: parseCorsOrigins(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN),
};
