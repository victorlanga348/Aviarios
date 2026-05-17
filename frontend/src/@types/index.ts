export type BatchStatus = 'ACTIVE' | 'CLOSED';
export type PaymentStatus = 'PENDENTE' | 'PAGO' | 'PARCIALMENTE_PAGO';
export type PaymentType = 'DINHEIRO' | 'TRANSFERENCIA' | 'CARTAO';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Batch {
  id: string;
  name: string;
  startDate: string;
  initialQuantity: number;
  actualQuantity: number;
  costPerBird: number;
  transportCost: number;
  status: BatchStatus;
}

export interface Sale {
  id: string;
  batchId: string;
  customerId: string;
  customerName?: string;
  batchName?: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  amountPaid: number;
  balance: number;
  status: PaymentStatus;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
}

export interface BatchCreateInput {
  name: string;
  initialQuantity: number;
  costPerBird: number;
  transportCost: number;
  startDate?: string;
}

export interface SaleCreateInput {
  batchId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  quantity: number;
  unitPrice: number;
  amountPaid: number;
  date?: string;
}

export interface LossCreateInput {
  batchId: string;
  quantity: number;
  date?: string;
  reason?: string;
}

export interface BatchExpenseCreateInput {
  batchId: string;
  type: string;
  amount: number;
  description?: string;
}

export interface FixedExpenseCreateInput {
  description: string;
  amount: number;
  date?: string;
  category?: string;
}

export interface ReportFinancials {
  totalRevenue: number;
  costOfBirdsSold: number;
  specificExpenses: number;
  profit: number;
}

export interface ReportItem {
  id: string;
  name: string;
  startDate: string;
  status: BatchStatus;
  initialQuantity: number;
  actualQuantity: number | null;
  birdsSold: number;
  birdsLost: number;
  birdsRemaining: number;
  financials: ReportFinancials;
}

export interface MonthlyReport {
  totalIncomes: number;
  totalExpenses: number;
  profit: number;
  items: ReportItem[];
}