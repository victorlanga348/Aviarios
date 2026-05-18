import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import type { Customer, Sale } from '../@types';

export interface CustomerWithDebt extends Customer {
  totalDebt: number;
}

export interface ClientSalesResponse extends Customer {
  sales: Sale[];
}

export function useCustomers() {
  const queryClient = useQueryClient();

  const customersQuery = useQuery<CustomerWithDebt[]>({
    queryKey: ['customers-with-debt'],
    queryFn: async () => {
      const { data } = await api.get<CustomerWithDebt[]>('/clients/list');
      return data;
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: { name: string; phone?: string }) => {
      await api.post('/clients/create', data);
    },
    onSuccess: () => {
      toast.success('Cliente cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['customers-with-debt'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] }); // usado no useSales
    }
  });

  const registerPaymentMutation = useMutation({
    mutationFn: async (data: { saleId: string; amount: number; paymentType: string }) => {
      await api.post('/payments', data);
    },
    onSuccess: () => {
      toast.success('Pagamento registrado!');
      queryClient.invalidateQueries({ queryKey: ['customers-with-debt'] });
      queryClient.invalidateQueries({ queryKey: ['client-sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['report-monthly'] });
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/clients/${id}`);
    },
    onSuccess: () => {
      toast.success('Cliente removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['customers-with-debt'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['client-sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['report-monthly'] });
    }
  });

  return {
    customers: customersQuery.data ?? [],
    isLoading: customersQuery.isLoading,
    createCustomer: createCustomerMutation.mutateAsync,
    isCreating: createCustomerMutation.isPending,
    registerPayment: registerPaymentMutation.mutateAsync,
    isPaying: registerPaymentMutation.isPending,
    deleteCustomer: deleteCustomerMutation.mutateAsync,
    isDeleting: deleteCustomerMutation.isPending
  };
}

export function useClientSales(clientId: string | null) {
  return useQuery<ClientSalesResponse>({
    queryKey: ['client-sales', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data } = await api.get(`/sales/clients/${clientId}`);
      return data;
    },
    enabled: !!clientId
  });
}
