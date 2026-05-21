import axios from 'axios';
import toast from 'react-hot-toast';

// Usa o IP da máquina atual dinamicamente em vez de 'localhost' fixo
const backendHostname = window.location.hostname;
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${backendHostname}:3333/api`,
});

// Interceptor para injetar o Token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@AviarioPro:token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor para tratar erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o backend retorna 503 (manutenção), dispara evento para o MaintenanceBanner
    if (error.response?.status === 503 && error.response?.data?.error === 'SISTEMA_EM_MANUTENCAO') {
      window.dispatchEvent(new CustomEvent('maintenance_event', {
        detail: { estimatedTime: error.response.data.estimatedTime }
      }));
      // Não mostra toast duplicado para manutenção
      return Promise.reject(error);
    }

    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Ocorreu um erro inesperado';
    
    toast.error(message);

    // Se for erro de autenticação (401) ou acesso proibido (403), limpamos as credenciais e redirecionamos
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('@AviarioPro:token');
      localStorage.removeItem('@AviarioPro:user');
      window.location.href = '/login';
    }

    console.error('API Error:', message);
    return Promise.reject(error);
  }
);