import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User as UserIcon,
  Moon,
  Sun,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export function Perfil() {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('@AviarioPro:theme') as 'dark' | 'light') || 'dark'
  );

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    const root = window.document.documentElement;
    root.classList.toggle('dark', nextTheme === 'dark');
    root.classList.toggle('light', nextTheme === 'light');
    localStorage.setItem('@AviarioPro:theme', nextTheme);
  };

  const displayName = user?.name?.trim() || 'Sem nome definido';
  const displayEmail = user?.email?.trim() || 'Sem email definido';
  const roleLabel = user?.role === 'ADMIN' ? 'Administrador' : 'Utilizador';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserIcon className="text-primary" size={26} />
          Perfil
        </h1>
        <p className="text-sm text-muted mt-1">Dados da conta e preferências deste dispositivo.</p>
      </div>

      <section className="bg-card border border-border rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold shrink-0">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-foreground truncate">{displayName}</h2>
            <p className="text-sm text-muted truncate">{displayEmail}</p>
          </div>

          <span className="w-fit inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-muted">
            <ShieldCheck size={14} />
            {roleLabel}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-5">
          <div>
            <p className="text-xs text-muted">Nome</p>
            <p className="text-sm font-medium text-foreground mt-1 break-words">{displayName}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Email</p>
            <p className="text-sm font-medium text-foreground mt-1 break-words">{displayEmail}</p>
          </div>
        </div>
      </section>

      <section className="bg-card border border-border rounded-2xl p-5 sm:p-6">
        <h3 className="text-base font-semibold text-foreground">Preferências</h3>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleToggleTheme}
            className="flex-1 flex items-center justify-between gap-4 p-4 bg-secondary/40 border border-border rounded-xl text-left hover:bg-secondary/70 transition-colors"
          >
            <div>
              <p className="font-medium text-sm text-foreground">Tema</p>
              <p className="text-xs text-muted mt-0.5">{theme === 'dark' ? 'Escuro' : 'Claro'}</p>
            </div>
            {theme === 'dark' ? <Sun className="text-primary" size={20} /> : <Moon className="text-primary" size={20} />}
          </button>

          <button
            onClick={signOut}
            className="flex-1 flex items-center justify-between gap-4 p-4 border border-rose-500/20 rounded-xl text-left text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <div>
              <p className="font-medium text-sm">Sair</p>
              <p className="text-xs text-rose-500/70 mt-0.5">Terminar sessão neste aparelho</p>
            </div>
            <LogOut size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
