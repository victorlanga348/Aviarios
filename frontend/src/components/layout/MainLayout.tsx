import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalDate } from '../../contexts/DateContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Zap,
  History,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  BookOpen,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('@AviarioPro:theme') as 'dark' | 'light') || 'dark'
  );
  const { signOut, user } = useAuth();
  const { formattedDate, changeMonth } = useGlobalDate();
  const location = useLocation();
  const [prevIndex, setPrevIndex] = useState(0);

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
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/batches', label: 'Lotes', icon: Package },
    { path: '/sales', label: 'Vendas (PDV)', icon: ShoppingCart },
    { path: '/customers', label: 'Clientes', icon: Users },
    { path: '/finance', label: 'Financeiro', icon: Zap },
    { path: '/reports', label: 'Relatórios', icon: History },
    { path: '/guide', label: 'Manual', icon: BookOpen },
    { path: '/perfil', label: 'Perfil', icon: User },
    ...(user?.role === 'ADMIN' ? [{ path: '/admin', label: 'Painel Admin', icon: ShieldAlert }] : []),
  ];

  const currentIndex = routes.findIndex(r => r.path === location.pathname);
  const direction = currentIndex > prevIndex ? 30 : -30;

  const handleNavClick = () => {
    setPrevIndex(currentIndex);
    setIsSidebarOpen(false);
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group relative ${
      isActive 
        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
        : 'hover:bg-secondary/50 text-muted hover:text-foreground'
    }`;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card z-50 fixed top-0 left-0 right-0 shadow-sm">
        <h1 className="text-primary font-black italic tracking-tighter">AVIÁRIO PRO</h1>
        <div className="flex items-center gap-3">

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
                <Package className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-black italic tracking-tighter">AVIÁRIO<span className="text-primary">PRO</span></h1>
            </div>

            <nav className="flex flex-col gap-2">
              {routes.map((route) => (
                <NavLink 
                  key={route.path} 
                  to={route.path} 
                  className={getNavLinkClass} 
                  onClick={handleNavClick}
                >
                  <route.icon size={20} />
                  <span className="text-sm">{route.label}</span>
                </NavLink>
              ))}
            </nav>


          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 md:pl-72 flex flex-col min-w-0">
        <main className="flex-grow p-4 pt-24 md:pt-10 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden flex flex-col">
          {/* Seletor de Mês Global */}
          {(location.pathname === '/' || location.pathname === '/reports') && (
            <div className="flex justify-end mb-6 w-full z-10">
              <div className="flex items-center gap-2 bg-card border border-border p-1.5 rounded-2xl shadow-sm">
                <button 
                  onClick={() => changeMonth(-1)} 
                  className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted hover:text-foreground"
                  title="Mês Anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-bold text-sm min-w-[140px] text-center capitalize text-foreground">
                  {formattedDate}
                </span>
                <button 
                  onClick={() => changeMonth(1)} 
                  className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted hover:text-foreground"
                  title="Próximo Mês"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: direction }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -direction }}
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
