import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodObject } from 'zod';

/**
 * Middleware genérico para validação de requisições usando Zod.
 * Ele verifica o body, query e params da requisição contra um schema definido.
 * 
 * @param schema - O schema do Zod que define a estrutura esperada dos dados.
 */
export const validate = (schema: ZodObject<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Tenta validar os dados da requisição.
        // O parseAsync garante que validações assíncronas (como buscas no banco) funcionem se necessário.
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        
        // Se a validação passar, prossegue para o próximo middleware/controller.
        next();
    } catch (error) {
        // Se o erro for especificamente do Zod (erro de validação de dados)
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: 'Dados inválidos',
                // Mapeia os erros para um formato amigável para o front-end
                details: error.issues.map(err => ({
                    field: err.path.join('.'), // Ex: "body.email"
                    message: err.message       // Ex: "Email inválido"
                }))
            });
        }
        
        // Se for qualquer outro erro inesperado, passa para o middleware de erro global
        next(error);
    }
};
