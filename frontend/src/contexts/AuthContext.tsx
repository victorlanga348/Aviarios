import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedUser = localStorage.getItem('@AviarioPro:user');
    const storagedToken = localStorage.getItem('@AviarioPro:token');

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));
    }
    
    setLoading(false);
  }, []);

  // Sincronização periódica do perfil
  useEffect(() => {
    const storagedToken = localStorage.getItem('@AviarioPro:token');
    if (!user || !storagedToken) return;

    const syncProfile = async () => {
      try {
        const response = await api.get('/profile/me');
        const freshUser = response.data.user;
        if (freshUser) {
          if (freshUser.id === user.id && (freshUser.role !== user.role || freshUser.name !== user.name || freshUser.email !== user.email)) {
            setUser(freshUser);
            localStorage.setItem('@AviarioPro:user', JSON.stringify(freshUser));
          }
        }
      } catch (err: any) {
        console.error("Erro ao sincronizar perfil:", err);
        if (err.response?.status === 401) {
          signOut();
        }
      }
    };

    // Executa a primeira verificação após 1 segundo
    const timeout = setTimeout(syncProfile, 1000);
    const interval = setInterval(syncProfile, 15000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [user?.id]);

  async function signIn({ email, password }: SignInCredentials) {
    const response = await api.post('/login', { email, password });

    const { token, user: userData } = response.data;

    setUser(userData);

    localStorage.setItem('@AviarioPro:user', JSON.stringify(userData));
    localStorage.setItem('@AviarioPro:token', token);
    localStorage.setItem('@AviarioPro:hasAccount', 'true');
  }

  function signOut() {
    localStorage.removeItem('@AviarioPro:token');
    localStorage.removeItem('@AviarioPro:user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, 
      user, 
      loading, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);