import * as z from 'zod';

export const batchSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  initialQuantity: z.number({ message: 'Informe a quantidade' }).min(1, 'Quantidade inicial obrigatória'),
  costPerBird: z.number({ message: 'Informe o custo' }).min(0.01, 'Custo unitário obrigatório'),
  transportCost: z.coerce.number({ message: 'Informe o custo de transporte' }).min(0, 'O custo de transporte não pode ser negativo'),
});

export type BatchFormData = z.infer<typeof batchSchema>;