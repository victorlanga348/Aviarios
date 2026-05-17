import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useGlobalDate } from '../contexts/DateContext';
import type { ReportFinancials, BatchStatus } from '../@types';

interface BatchWithFinancials {
  id: string;
  name: string;
  startDate: string;
  initialQuantity: number;
  actualQuantity: number | null;
  costPerBird: number;
  transportCost: number;
  status: BatchStatus;
  financials: ReportFinancials;
}

export function useReports() {
  const { queryMonth, queryYear } = useGlobalDate();
  const queryClient = useQueryClient();

  // Relatório Mensal Detalhado
  const monthlyReportQuery = useQuery({
    queryKey: ['report-monthly', queryMonth, queryYear],
    queryFn: async () => {
      const response = await api.get('/reports', {
        params: { month: queryMonth, year: queryYear }
      });
      
      const batches: BatchWithFinancials[] = response.data;
      
      // Transformar a lista de lotes no formato que a página espera
      const totalIncomes = batches.reduce((acc: number, b: BatchWithFinancials) => acc + b.financials.totalRevenue, 0);
      const totalExpenses = batches.reduce((acc: number, b: BatchWithFinancials) => acc + b.financials.costOfBirdsSold + b.financials.specificExpenses, 0);
      const netMargin = totalIncomes - totalExpenses;
      const items = batches.map((b: BatchWithFinancials) => ({
        id: b.id,
        description: `Lote: ${b.name}`,
        type: 'Operacional',
        amount: b.financials.costOfBirdsSold + b.financials.specificExpenses
      }));

      return {
        totalIncomes,
        totalExpenses,
        netMargin,
        items
      };
    }
  });

  // Mutação para Fechar Lote
  const closeBatchMutation = useMutation({
    mutationFn: async (batchId: string) => {
      await api.patch(`/batches/${batchId}/status`, { status: 'CLOSED' });
    },
    onSuccess: () => {
      toast.success('Lote encerrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['report-monthly'] });
    }
  });

  return {
    report: monthlyReportQuery.data,
    isLoading: monthlyReportQuery.isLoading,
    closeBatch: closeBatchMutation.mutateAsync,
    isClosing: closeBatchMutation.isPending
  };
}