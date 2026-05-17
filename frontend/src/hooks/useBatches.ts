import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import type { Batch, BatchCreateInput } from '../@types';

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
    },
  });

  return {
    batches: batchesQuery.data ?? [],
    isLoading: batchesQuery.isLoading,
    createBatch: createBatchMutation.mutateAsync,
    isCreating: createBatchMutation.isPending,
    updateBatchStatus: updateBatchStatusMutation.mutateAsync,
    isUpdatingStatus: updateBatchStatusMutation.isPending
  };
}