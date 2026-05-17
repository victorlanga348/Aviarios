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

  async function signIn({ email, password }: SignInCredentials) {
    const response = await api.post('/login', { email, password });

    const { token, user: userData } = response.data;

    setUser(userData);

    localStorage.setItem('@AviarioPro:user', JSON.stringify(userData));
    localStorage.setItem('@AviarioPro:token', token);
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