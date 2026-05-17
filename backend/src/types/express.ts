import type { Request } from 'express';

// ─── Module Augmentation ─────────────────────────────────────────────────────
// Extends Express's Request interface globally so that `req.userId` is
// recognised everywhere without any cast or custom type.
declare module 'express-serve-static-core' {
    interface Request {
        userId?: string;
    }
}

// ─── Re-export ───────────────────────────────────────────────────────────────
// Controllers that need a guaranteed userId (i.e. behind authMiddleware) can
// import AuthenticatedRequest and cast internally via a simple assertion.
export interface AuthenticatedRequest extends Request {
    userId: string;
}

/**
 * Type-safe helper to extract the message from an unknown catch value.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Ocorreu um erro inesperado.';
}
