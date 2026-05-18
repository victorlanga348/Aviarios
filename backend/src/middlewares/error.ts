import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    status?: number;
    stack?: string;
}

/**
 * Middleware Global de Tratamento de Erros.
 * Captura qualquer erro disparado nos controllers (via next(error)) e padroniza a resposta da API.
 */
export function errorMiddleware(err: AppError, req: Request, res: Response, next: NextFunction) {
    // Loga o erro no console do servidor para depuração
    console.error(`[Servidor] Erro detectado: ${err.message}`);

    // Define o status HTTP (se não houver, assume 500 - Erro Interno)
    const status = err.status || 500;
    const message = err.message || 'Ocorreu um erro inesperado no servidor.';

    // Retorna a resposta formatada
    res.status(status).json({
        error: message,
        message: message, // Support both error and message fields
        // Em desenvolvimento, mostra o stack trace para facilitar o conserto.
        // Em produção, o stack é escondido por segurança.
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}
