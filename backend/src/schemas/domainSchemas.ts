import { z } from 'zod';

const uuidParam = (name: string) => z.object({
    params: z.object({
        [name]: z.string().uuid('Identificador inválido'),
    }),
});

const optionalDateString = z
    .string()
    .refine(value => !Number.isNaN(Date.parse(value)), 'Data inválida')
    .optional();

export const batchCreateSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, 'Nome do lote é obrigatório'),
        costPerBird: z.coerce.number().positive('Custo por ave deve ser maior que zero'),
        initialQuantity: z.coerce.number().int().positive('Quantidade inicial deve ser maior que zero'),
        transportCost: z.coerce.number().min(0, 'Custo de transporte não pode ser negativo').optional(),
        status: z.enum(['ACTIVE', 'CLOSED']).optional(),
    }),
});

export const batchStatusSchema = uuidParam('id').extend({
    body: z.object({
        status: z.enum(['ACTIVE', 'CLOSED']),
    }),
});

export const idParamSchema = uuidParam('id');
export const batchIdParamSchema = uuidParam('batchId');
export const clientIdParamSchema = uuidParam('clientId');

export const saleCreateSchema = z.object({
    body: z.object({
        batchId: z.string().uuid('Selecione um lote válido'),
        quantity: z.coerce.number().int().positive('Quantidade deve ser maior que zero'),
        customerId: z.string().uuid('Cliente inválido').optional().or(z.literal('')),
        customerName: z.string().trim().min(2, 'Nome do cliente deve ter pelo menos 2 caracteres').optional().or(z.literal('')),
        customerPhone: z.string().trim().optional().or(z.literal('')),
        unitPrice: z.coerce.number().positive('Preço unitário deve ser maior que zero').optional(),
        amountPaid: z.coerce.number().min(0, 'Valor pago não pode ser negativo').optional(),
        isScheduled: z.boolean().optional(),
        scheduledDeliveryDate: optionalDateString.or(z.literal('')),
        debtDueDate: optionalDateString.or(z.literal('')),
    }).refine(data => data.customerId || data.customerName, {
        message: 'Selecione um cliente ou informe o nome para um novo cadastro.',
        path: ['customerId'],
    }),
});
