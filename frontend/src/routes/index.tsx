import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { MaintenanceBanner } from '../components/layout/MaintenanceBanner';
import { Dashboard } from '../pages/Dashboard';
import { Batches } from '../pages/Batches';
import { Sales } from '../pages/Sales';
import { Finance } from '../pages/Finance';
import { Reports } from '../pages/Reports';
import { Customers } from '../pages/Customers';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Landing } from '../pages/Landing';
import { Admin } from '../pages/Admin';
import { Guide } from '../pages/Guide';
import { Perfil } from '../pages/Perfil';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// 1. Rota protegida do Administrador (Manda para /login se não logado)
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!signed) return <Navigate to="/login" />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" />;

  return <>{children}</>;
}

// 2. Rota protegida do Usuário Comum (Manda para /login se não logado)
function UserRoute({ children }: { children: React.ReactNode }) {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!signed) return <Navigate to="/login" />;

  return <>{children}</>;
}

// 3. Controle da Raiz "/" (Manda pro painel se logado, se deslogado mostra a Landing)
function HomeRoute() {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (signed) {
    return user?.role === 'ADMIN' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
  }

  return <Landing />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MaintenanceBanner />
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/landing" element={<Landing />} />

          {/* Rota Raiz */}
          <Route path="/" element={<HomeRoute />} />
          
          {/* Rotas de Usuário Autenticado */}
          <Route path="/dashboard" element={<UserRoute><MainLayout><Dashboard /></MainLayout></UserRoute>} />
          <Route path="/batches" element={<UserRoute><MainLayout><Batches /></MainLayout></UserRoute>} />
          <Route path="/sales" element={<UserRoute><MainLayout><Sales /></MainLayout></UserRoute>} />
          <Route path="/customers" element={<UserRoute><MainLayout><Customers /></MainLayout></UserRoute>} />
          <Route path="/finance" element={<UserRoute><MainLayout><Finance /></MainLayout></UserRoute>} />
          <Route path="/reports" element={<UserRoute><MainLayout><Reports /></MainLayout></UserRoute>} />
          <Route path="/guide" element={<UserRoute><MainLayout><Guide /></MainLayout></UserRoute>} />
          <Route path="/perfil" element={<UserRoute><MainLayout><Perfil /></MainLayout></UserRoute>} />
          
          {/* Rota de Administrador Autenticado */}
          <Route path="/admin" element={<AdminRoute><AdminLayout><Admin /></AdminLayout></AdminRoute>} />
          
          {/* Qualquer outra rota inexistente manda de volta para a raiz */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}