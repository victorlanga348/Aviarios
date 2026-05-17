import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import type { LossCreateInput, BatchExpenseCreateInput, FixedExpenseCreateInput } from '../@types';

export function useFinance() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['batches'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['finance'] });
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

  return {
    registerLoss: createLoss.mutateAsync,
    registerBatchExpense: createBatchExpense.mutateAsync,
    registerFixedExpense: createFixedExpense.mutateAsync,
    isProcessing: createLoss.isPending || createBatchExpense.isPending || createFixedExpense.isPending
  };
}