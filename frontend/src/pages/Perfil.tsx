import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User as UserIcon, 
  Moon, 
  Sun, 
  LogOut, 
  Settings
} from 'lucide-react';

export function Perfil() {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('@AviarioPro:theme') as 'dark' | 'light') || 'dark'
  );

  useEffect(() => {
    // Sincroniza o tema atual do localStorage
    const savedTheme = localStorage.getItem('@AviarioPro:theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    const root = window.document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('@AviarioPro:theme', nextTheme);
  
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black italic tracking-tight flex items-center gap-2">
          <UserIcon className="text-primary" size={32} />
          MEU PERFIL
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center text-primary text-4xl font-black border-2 border-primary/30">
              {user?.name?.[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-xs text-muted font-medium">{user?.email}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              user?.role === 'ADMIN' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted'
            }`}>
              {user?.role === 'ADMIN' ? 'Administrador' : 'Produtor'}
            </span>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-muted">Nome de Usuário</span>
              <span className="text-sm font-medium text-foreground">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-muted">Email</span>
              <span className="text-sm font-medium text-foreground">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Configurations Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme & Actions Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Settings className="text-primary" size={20} />
              Configurações Rápidas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={handleToggleTheme}
                className="flex items-center justify-between p-4 bg-secondary/40 border border-border rounded-2xl text-left hover:bg-secondary/70 transition-all group"
              >
                <div className="space-y-1">
                  <p className="font-bold text-sm text-foreground">Tema do Sistema</p>
                  <p className="text-xs text-muted font-medium">Troque entre claro e escuro</p>
                </div>
                <div className="w-10 h-10 bg-card rounded-xl border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-all">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </div>
              </button>

              {/* Log Out */}
              <button 
                onClick={signOut}
                className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-left hover:bg-rose-500/10 transition-all group"
              >
                <div className="space-y-1">
                  <p className="font-bold text-sm text-rose-500">Sair do Sistema</p>
                  <p className="text-xs text-rose-500/60 font-medium">Encerrar sessão no aparelho</p>
                </div>
                <div className="w-10 h-10 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-all">
                  <LogOut size={20} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
