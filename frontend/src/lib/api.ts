import axios from 'axios';
import toast from 'react-hot-toast';

// Usa o IP da máquina atual dinamicamente em vez de 'localhost' fixo
const backendHostname = window.location.hostname;
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${backendHostname}:3000/api`,
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
    const message = error.response?.data?.message || error.message || 'Ocorreu um erro inesperado';
    
    toast.error(message);

    // Se for erro de autenticação (401), podemos limpar o token e redirecionar
    if (error.response?.status === 401) {
      localStorage.removeItem('@AviarioPro:token');
      window.location.href = '/login';
    }

    console.error('API Error:', message);
    return Promise.reject(error);
  }
);