import * as z from 'zod';

// Validação para Registro de Mortes
export const lossSchema = z.object({
  batchId: z.string().uuid('Selecione um lote'),
  quantity: z.number({ message: 'Informe a quantidade' }).min(1, 'Mínimo de 1 ave'),
  reason: z.string().optional(),
});

// Validação para Despesas de Lote (Ração/Vacina)
export const batchExpenseSchema = z.object({
  batchId: z.string().uuid('Selecione um lote'),
  type: z.enum(['RACAO', 'VACINA']),
  amount: z.number({ message: 'Informe o valor gasto' }).min(1, 'Informe o valor gasto'),
  description: z.string().optional(),
});

// Validação para Despesas Fixas (Luz/Água)
export const fixedExpenseSchema = z.object({
  description: z.string().min(3, 'Descrição obrigatória'),
  amount: z.number({ message: 'Informe o valor' }).min(1, 'Informe o valor'),
  date: z.string(), // O seletor global de data ajudará aqui
});

export type LossFormData = z.infer<typeof lossSchema>;
export type BatchExpenseFormData = z.infer<typeof batchExpenseSchema>;
export type FixedExpenseFormData = z.infer<typeof fixedExpenseSchema>;