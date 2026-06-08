import axios from 'axios';
import toast from 'react-hot-toast';

const normalizeApiUrl = (value?: string) => {
  if (!value) return '';
  return value.trim().replace(/\/+$/, '');
};

const isLocalHostName = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

const isPrivateLanHostName = (hostname: string) =>
  /^(10|172\.(1[6-9]|2\d|3[0-1])|192\.168)\./.test(hostname);

const resolveApiBaseUrl = () => {
  const configuredUrl = normalizeApiUrl(import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL);
  if (configuredUrl) {
    return configuredUrl.endsWith('/api') ? configuredUrl : `${configuredUrl}/api`;
  }

  const { hostname } = window.location;
  const isLocalhost = isLocalHostName(hostname);
  const isPrivateLan = isPrivateLanHostName(hostname);

  if (isLocalhost || isPrivateLan) {
    return `http://${hostname}:3333/api`;
  }

  return '/api';
};

export const API_BASE_URL = resolveApiBaseUrl();
const API_CONFIG_ERROR = (() => {
  const configuredUrl = normalizeApiUrl(import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL);
  const { hostname } = window.location;
  const isLocalhost = isLocalHostName(hostname);
  const isPrivateLan = isPrivateLanHostName(hostname);

  if (!configuredUrl && !isLocalhost && !isPrivateLan) {
    return 'URL da API não configurada. Defina VITE_API_URL no frontend com a URL pública do backend.';
  }

  return '';
})();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const getApiErrorMessage = (error: unknown, fallback = 'Ocorreu um erro inesperado') => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return `Não foi possível conectar ao servidor. Verifique se o backend está online e se a URL da API está correta (${API_BASE_URL}).`;
    }

    return error.response.data?.message || error.response.data?.error || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

api.interceptors.request.use((config) => {
  if (API_CONFIG_ERROR) {
    throw new Error(API_CONFIG_ERROR);
  }

  const token = localStorage.getItem('@AviarioPro:token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 503 && error.response?.data?.error === 'SISTEMA_EM_MANUTENCAO') {
      window.dispatchEvent(new CustomEvent('maintenance_event', {
        detail: { estimatedTime: error.response.data.estimatedTime }
      }));
      return Promise.reject(error);
    }

    const message = getApiErrorMessage(error);

    toast.error(message);

    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('@AviarioPro:token');
      localStorage.removeItem('@AviarioPro:user');
      window.location.href = '/login';
    }

    console.error('API Error:', {
      message,
      baseURL: API_BASE_URL,
      url: error.config?.url,
      status: error.response?.status,
    });

    return Promise.reject(error);
  }
);
