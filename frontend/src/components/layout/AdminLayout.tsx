import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ShieldAlert,
  Sun,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useThemePreference } from '../../hooks/useThemePreference';
import { fastTransition, motionTransition, overlayVariants, pageVariants } from '../../lib/animations';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useThemePreference();
  const { signOut, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const routes = [
    { path: '/admin', label: 'Admin', icon: ShieldAlert },
    { path: '/dashboard', label: 'Meu aviário', icon: LayoutDashboard },
  ];

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group relative ${
      isActive
        ? 'bg-primary text-white'
        : 'text-muted hover:bg-secondary/50 hover:text-foreground'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300 md:flex-row">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-border bg-card p-4 shadow-sm md:hidden">
        <h1 className="text-primary font-black italic tracking-tighter">ADMIN PRO</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2 text-muted transition-colors hover:text-foreground"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
            aria-expanded={isSidebarOpen}
            className="p-2 text-muted transition-colors hover:text-foreground"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={fastTransition}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          className={`
            fixed top-0 left-0 z-50 h-dvh w-72 overflow-y-auto border-r border-border bg-card p-6 scrollbar-hide
            flex flex-col gap-6 transition-colors duration-300 md:flex md:gap-8
            ${!isSidebarOpen && 'hidden md:flex'}
          `}
        >
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black italic tracking-tighter">
              ADMIN<span className="text-primary">PRO</span>
            </h1>
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

          <div className="mt-auto space-y-4 border-t border-border pt-6">
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden w-full items-center gap-4 rounded-2xl px-4 py-3.5 font-bold text-muted transition-all hover:bg-secondary/50 hover:text-foreground md:flex"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span className="text-sm">Alternar Tema</span>
            </button>

            <div className="flex items-center gap-4 rounded-2xl border border-border bg-secondary px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/20 font-black text-primary">
                {user?.name?.[0].toUpperCase()}
              </div>
              <div className="flex-grow overflow-hidden">
                <p className="truncate text-xs font-black">{user?.name}</p>
                <p className="truncate text-[10px] font-bold text-primary">Administrador</p>
              </div>
              <button
                type="button"
                onClick={signOut}
                aria-label="Terminar sessão"
                className="rounded-xl p-2 text-foreground/70 transition-all hover:bg-rose-500/10 hover:text-rose-500"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col md:pl-72">
        <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col overflow-x-hidden p-4 pt-24 md:p-10 md:pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={motionTransition}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
