import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Moon,
  LayoutDashboard,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('@AviarioPro:theme') as 'dark' | 'light') || 'dark'
  );
  const { signOut, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('@AviarioPro:theme', theme);
  }, [theme]);

  // Scroll para o topo ao mudar de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const routes = [
    { path: '/admin', label: 'Painel Admin', icon: ShieldAlert },
    { path: '/dashboard', label: 'Acessar Meu Aviário', icon: LayoutDashboard },
  ];

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group relative ${isActive
      ? 'bg-primary text-white shadow-lg shadow-primary/20'
      : 'hover:bg-secondary/50 text-muted hover:text-foreground'
    }`;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground transition-colors duration-300">

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card z-50 fixed top-0 left-0 right-0 shadow-sm">
        <h1 className="text-primary font-black italic tracking-tighter">ADMIN PRO</h1>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 text-muted hover:text-foreground transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-muted hover:text-foreground transition-colors">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className={`
              fixed top-0 left-0 z-50 w-72 h-[100dvh] bg-card overflow-y-auto scrollbar-hide
              border-r border-border p-6 flex flex-col gap-6 md:gap-8 transition-colors duration-300
              ${!isSidebarOpen && 'hidden md:flex'}
            `}
          >
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldAlert className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-black italic tracking-tighter">ADMIN<span className="text-primary">PRO</span></h1>
            </div>

            <nav className="flex flex-col gap-2">
              {routes.map((route) => (
                <NavLink
                  key={route.path}
                  to={route.path}
                  className={getNavLinkClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <route.icon size={20} />
                  <span className="text-sm">{route.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-border space-y-4">
              <button
                onClick={toggleTheme}
                className="hidden md:flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold text-muted hover:bg-secondary/50 hover:text-foreground transition-all"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-sm">Alternar Tema</span>
              </button>

              <div className="flex items-center gap-4 px-4 py-3 bg-secondary rounded-2xl border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black border border-primary/30">
                  {user?.name?.[0].toUpperCase()}
                </div>
                <div className="flex-grow overflow-hidden">
                  <p className="text-xs font-black truncate">{user?.name}</p>
                  <p className="text-[10px] text-muted font-bold text-primary truncate">Administrador</p>
                </div>
                <button onClick={signOut} className="p-2 text-foreground/70 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 md:pl-72 flex flex-col min-w-0">
        <main className="flex-grow p-4 pt-24 md:pt-10 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
