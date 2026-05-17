import * as z from 'zod';

export const saleSchema = z.object({
  batchId: z.string().uuid('Selecione um lote'),
  customerId: z.string().uuid().optional().or(z.literal('')),
  customerName: z.string().min(3, 'Nome do cliente deve ter no mínimo 3 caracteres').optional().or(z.literal('')),
  customerPhone: z.string().optional().or(z.literal('')),
  quantity: z.number({ message: 'Informe a quantidade' }).min(1, 'Mínimo de 1 ave'),
  unitPrice: z.number({ message: 'Informe o preço' }).min(1, 'Defina o preço unitário'),
  amountPaid: z.number({ message: 'Informe o valor pago' }).min(0, 'O valor pago não pode ser negativo'),
}).refine(data => data.customerId || data.customerName, {
  message: "Selecione um cliente ou digite o nome para um novo cadastro",
  path: ["customerId"]
});

export type SaleFormData = z.infer<typeof saleSchema>;