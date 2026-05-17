import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useGlobalDate } from '../contexts/DateContext';

interface DashboardData {
  totalLiveBirds: number;
  totalToReceive: number;
  realProfit: number;
  cashBalance: number;
}

export function useDashboard() {
  const { queryMonth, queryYear } = useGlobalDate();

  return useQuery<DashboardData>({
    queryKey: ['dashboard', queryMonth, queryYear],
    queryFn: async () => {
      const response = await api.get('/dashboard', {
        params: { month: queryMonth, year: queryYear }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });
}