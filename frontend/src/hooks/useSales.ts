import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import type { Sale, Customer, SaleCreateInput } from '../@types';

export function useSales() {
  const queryClient = useQueryClient();

  // Buscar clientes (necessário para o modal de venda)
  const customersQuery = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('/clients/list');
      return response.data;
    },
  });

  // Buscar vendas recentes
  const salesQuery = useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await api.get('/sales');
      return response.data;
    },
  });

  // Criar venda
  const createSaleMutation = useMutation({
    mutationFn: async (saleData: SaleCreateInput) => {
      await api.post('/sales', saleData);
    },
    onSuccess: () => {
      toast.success('Venda registrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-debt'] });
    },
  });

  return {
    customers: customersQuery.data ?? [],
    recentSales: salesQuery.data ?? [],
    isLoadingSales: salesQuery.isLoading,
    isLoadingCustomers: customersQuery.isLoading,
    createSale: createSaleMutation.mutateAsync,
    isCreating: createSaleMutation.isPending
  };
}