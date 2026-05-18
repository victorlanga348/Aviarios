import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import type { LossCreateInput, BatchExpenseCreateInput, FixedExpenseCreateInput } from '../@types';

export function useFinance(month?: number, year?: number) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['batches'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['finance'] });
    queryClient.invalidateQueries({ queryKey: ['batch-expenses'] });
    queryClient.invalidateQueries({ queryKey: ['report-monthly'] });
  };

  const createLoss = useMutation({
    mutationFn: (data: LossCreateInput) => api.post('/losses', data),
    onSuccess: () => {
      toast.success('Perda registrada');
      invalidateAll();
    },
  });

  const createBatchExpense = useMutation({
    mutationFn: (data: BatchExpenseCreateInput) => api.post('/batch-expenses', data),
    onSuccess: () => {
      toast.success('Despesa do lote registrada');
      invalidateAll();
    },
  });

  const createFixedExpense = useMutation({
    mutationFn: (data: FixedExpenseCreateInput) => api.post('/fixed-expenses', data),
    onSuccess: () => {
      toast.success('Despesa fixa registrada');
      invalidateAll();
    },
  });

  const deleteFixedExpense = useMutation({
    mutationFn: (id: string) => api.delete(`/fixed-expenses/${id}`),
    onSuccess: () => {
      toast.success('Despesa removida');
      invalidateAll();
    },
  });

  const deleteBatchExpense = useMutation({
    mutationFn: (id: string) => api.delete(`/batch-expenses/${id}`),
    onSuccess: () => {
      toast.success('Despesa de insumo removida');
      invalidateAll();
    },
  });

  const targetMonth = month ?? (new Date().getMonth() + 1);
  const targetYear = year ?? new Date().getFullYear();

  const { data: fixedExpensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['finance', 'fixed-expenses', targetMonth, targetYear],
    queryFn: async () => {
      const response = await api.get('/fixed-expenses', {
        params: { month: targetMonth, year: targetYear }
      });
      return response.data as {
        expenses: Array<{
          id: string;
          description: string;
          amount: number;
          date: string;
        }>;
        total: number;
        dailyValue: number;
        month: number;
        year: number;
        daysInMonth: number;
      };
    }
  });

  return {
    registerLoss: createLoss.mutateAsync,
    registerBatchExpense: createBatchExpense.mutateAsync,
    registerFixedExpense: createFixedExpense.mutateAsync,
    removeFixedExpense: deleteFixedExpense.mutateAsync,
    removeBatchExpense: deleteBatchExpense.mutateAsync,
    fixedExpensesData,
    isLoadingExpenses,
    isProcessing: createLoss.isPending || createBatchExpense.isPending || createFixedExpense.isPending || deleteFixedExpense.isPending || deleteBatchExpense.isPending
  };
}