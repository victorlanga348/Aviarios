import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from '../components/common/AppErrorBoundary';
import { FullscreenLoader } from '../components/common/FullscreenLoader';
import { AdminLayout } from '../components/layout/AdminLayout';
import { MainLayout } from '../components/layout/MainLayout';
import { MaintenanceBanner } from '../components/layout/MaintenanceBanner';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const Dashboard = lazy(() => import('../pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Batches = lazy(() => import('../pages/Batches').then((module) => ({ default: module.Batches })));
const Sales = lazy(() => import('../pages/Sales').then((module) => ({ default: module.Sales })));
const Finance = lazy(() => import('../pages/Finance').then((module) => ({ default: module.Finance })));
const Reports = lazy(() => import('../pages/Reports').then((module) => ({ default: module.Reports })));
const Customers = lazy(() => import('../pages/Customers').then((module) => ({ default: module.Customers })));
const Login = lazy(() => import('../pages/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('../pages/Register').then((module) => ({ default: module.Register })));
const Landing = lazy(() => import('../pages/Landing').then((module) => ({ default: module.Landing })));
const Admin = lazy(() => import('../pages/Admin').then((module) => ({ default: module.Admin })));
const Guide = lazy(() => import('../pages/Guide').then((module) => ({ default: module.Guide })));
const Perfil = lazy(() => import('../pages/Perfil').then((module) => ({ default: module.Perfil })));

function RouteLoader() {
  return <FullscreenLoader label="A carregar página." />;
}

function withSuspense(children: ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  if (!signed) return <Navigate to="/login" />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" />;

  return <>{children}</>;
}

function UserRoute({ children }: { children: ReactNode }) {
  const { signed, loading } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  if (!signed) return <Navigate to="/login" />;

  return <>{children}</>;
}

function HomeRoute() {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  if (signed) {
    return user?.role === 'ADMIN' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
  }

  return <Landing />;
}

export function AppRoutes() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <MaintenanceBanner />
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/landing" element={<Landing />} />

              <Route path="/" element={<HomeRoute />} />

              <Route path="/dashboard" element={<UserRoute>{withSuspense(<MainLayout><Dashboard /></MainLayout>)}</UserRoute>} />
              <Route path="/batches" element={<UserRoute>{withSuspense(<MainLayout><Batches /></MainLayout>)}</UserRoute>} />
              <Route path="/sales" element={<UserRoute>{withSuspense(<MainLayout><Sales /></MainLayout>)}</UserRoute>} />
              <Route path="/customers" element={<UserRoute>{withSuspense(<MainLayout><Customers /></MainLayout>)}</UserRoute>} />
              <Route path="/finance" element={<UserRoute>{withSuspense(<MainLayout><Finance /></MainLayout>)}</UserRoute>} />
              <Route path="/reports" element={<UserRoute>{withSuspense(<MainLayout><Reports /></MainLayout>)}</UserRoute>} />
              <Route path="/guide" element={<UserRoute>{withSuspense(<MainLayout><Guide /></MainLayout>)}</UserRoute>} />
              <Route path="/perfil" element={<UserRoute>{withSuspense(<MainLayout><Perfil /></MainLayout>)}</UserRoute>} />

              <Route path="/admin" element={<AdminRoute>{withSuspense(<AdminLayout><Admin /></AdminLayout>)}</AdminRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
