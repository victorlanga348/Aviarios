import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import type { Batch, BatchCreateInput, LossCreateInput } from '../@types';

export function useBatches() {
  const queryClient = useQueryClient();

  // Buscar lotes
  const batchesQuery = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await api.get('/batches');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });

  // Criar lote
  const createBatchMutation = useMutation({
    mutationFn: async (newBatch: BatchCreateInput) => {
      await api.post('/batches', newBatch);
    },
    onSuccess: () => {
      toast.success('Lote criado com sucesso!');
      // "Invalida" o cache para forçar o React Query a buscar a lista atualizada
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['report-monthly'] });
    },
  });

  // Atualizar status do lote
  const updateBatchStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'CLOSED' }) => {
      await api.patch(`/batches/${id}/status`, { status });
    },
    onSuccess: () => {
      toast.success('Status do lote atualizado!');
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['report-monthly'] });
    },
  });

  // Deletar lote
  const deleteBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/batches/${id}`);
    },
    onSuccess: () => {
      toast.success('Lote deletado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['report-monthly'] });
    },
    onError: () => {
      toast.error('Erro ao deletar lote.');
    }
  });

  // Registrar perda (morte)
  const registerLossMutation = useMutation({
    mutationFn: async (newLoss: LossCreateInput) => {
      await api.post('/losses', newLoss);
    },
    onSuccess: () => {
      toast.success('Morte/Perda registrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['report-monthly'] });
    },
    onError: (error: unknown) => {
      let msg = 'Erro ao registrar perda.';
      if (error && typeof error === 'object' && 'response' in error) {
        const errObj = error as { response?: { data?: { message?: string } } };
        msg = errObj.response?.data?.message || msg;
      }
      toast.error(msg);
    }
  });

  // Desfazer perda (morte)
  const undoLossMutation = useMutation({
    mutationFn: async (lossId: string) => {
      await api.delete(`/losses/${lossId}`);
    },
    onSuccess: () => {
      toast.success('Registro de morte desfeito com sucesso! Aves reincorporadas.');
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['report-monthly'] });
    },
    onError: (error: unknown) => {
      let msg = 'Erro ao desfazer perda.';
      if (error && typeof error === 'object' && 'response' in error) {
        const errObj = error as { response?: { data?: { message?: string } } };
        msg = errObj.response?.data?.message || msg;
      }
      toast.error(msg);
    }
  });

  return {
    batches: batchesQuery.data ?? [],
    isLoading: batchesQuery.isLoading,
    createBatch: createBatchMutation.mutateAsync,
    isCreating: createBatchMutation.isPending,
    updateBatchStatus: updateBatchStatusMutation.mutateAsync,
    isUpdatingStatus: updateBatchStatusMutation.isPending,
    deleteBatch: deleteBatchMutation.mutateAsync,
    isDeleting: deleteBatchMutation.isPending,
    registerLoss: registerLossMutation.mutateAsync,
    isRegisteringLoss: registerLossMutation.isPending,
    undoLoss: undoLossMutation.mutateAsync,
    isUndoingLoss: undoLossMutation.isPending
  };
}