import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { User } from '../@types';

interface SignInCredentials {
  email?: string;
  password?: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const USER_STORAGE_KEY = '@AviarioPro:user';
const TOKEN_STORAGE_KEY = '@AviarioPro:token';

const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!storedUser || !storedToken) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const queryClient = useQueryClient();
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    queryClient.removeQueries({ queryKey: ['auth-profile'] });
    setUser(null);
  }, [queryClient]);

  const profileQuery = useQuery({
    queryKey: ['auth-profile', user?.id],
    queryFn: async () => {
      try {
        const response = await api.get('/profile/me');
        return (response.data as { user?: User }).user ?? null;
      } catch (error: unknown) {
        console.error('Erro ao sincronizar perfil:', error);

        if (isAxiosError(error) && error.response?.status === 401) {
          signOut();
          return null;
        }

        throw error;
      }
    },
    enabled: !!user && !!token,
    refetchInterval: 15000,
    refetchOnWindowFocus: false,
    staleTime: 10000,
  });

  const resolvedUser =
    profileQuery.data && user && profileQuery.data.id === user.id
      ? profileQuery.data
      : user;

  useEffect(() => {
    if (!resolvedUser) return;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(resolvedUser));
  }, [resolvedUser]);

  async function signIn({ email, password }: SignInCredentials) {
    const response = await api.post('/login', { email, password });

    const { token: nextToken, user: userData } = response.data;

    setUser(userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem('@AviarioPro:hasAccount', 'true');
    queryClient.setQueryData(['auth-profile', userData.id], userData);
  }

  const loading = !!resolvedUser && !!token && profileQuery.fetchStatus === 'fetching' && !profileQuery.data;

  return (
    <AuthContext.Provider value={{
      signed: !!resolvedUser,
      user: resolvedUser,
      loading,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
