import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Dashboard } from '../pages/Dashboard';
import { Batches } from '../pages/Batches';
import { Sales } from '../pages/Sales';
import { Finance } from '../pages/Finance';
import { Reports } from '../pages/Reports';
import { Customers } from '../pages/Customers';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/batches" element={<ProtectedRoute><MainLayout><Batches /></MainLayout></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><MainLayout><Sales /></MainLayout></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><MainLayout><Customers /></MainLayout></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><MainLayout><Finance /></MainLayout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}