import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { DateProvider } from './contexts/DateContext';
import { AppRoutes } from './routes';

const toastOptions = {
  duration: 1800,
  style: {
    background: '#18181b',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1rem',
  },
  success: {
    duration: 1500,
    iconTheme: {
      primary: '#10b981',
      secondary: '#000',
    },
  },
  error: {
    duration: 2500,
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DateProvider>
        <MotionConfig reducedMotion="user">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={toastOptions}
          />
        </MotionConfig>
      </DateProvider>
    </QueryClientProvider>
  );
}
