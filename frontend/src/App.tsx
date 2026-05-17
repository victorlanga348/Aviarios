import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { DateProvider } from './contexts/DateContext';
import { AppRoutes } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita requisições extras ao alternar de abas/janelas
      staleTime: 1000 * 60 * 5,    // Cache de 5 minutos por padrão para todas as buscas
      retry: 1,                    // Limita a 1 tentativa de reenvio em caso de falha de rede
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DateProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 1800, // Toasts comuns desaparecem em 1.8 segundos
            style: {
              background: '#18181b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
            },
            success: {
              duration: 1500, // Sucesso desaparece bem rápido em 1.5 segundos
              iconTheme: {
                primary: '#fbbf24',
                secondary: '#000',
              },
            },
            error: {
              duration: 2500, // Erros duram um pouquinho mais (2.5 segundos) para leitura rápida do problema
            }
          }}
        />
      </DateProvider>
    </QueryClientProvider>
  );
}