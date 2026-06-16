import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  AlertTriangle,
  X,
  Clock,
  Square,
  Save,
  Trash2,
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  PlayCircle,
  Wrench,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { fastTransition, modalVariants, motionTransition, overlayVariants } from '../lib/animations';

interface MaintenanceConfig {
  isActive: boolean;
  status: MaintenanceStatus;
  type: string;
  clientName: string;
  equipment: string;
  description: string;
  estimatedTime: string;
  scheduledStart: string | null;
  durationHours: number | null;
  leadTimeHours: number | null;
}

type MaintenanceStatus = 'PENDENTE' | 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

interface AdminStats {
  totalSalesValue: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  totalChickens: number;
  isFirstAdmin?: boolean;
  _count: {
    batches: number;
    sales: number;
  };
}

interface ApiErrorData {
  error?: string;
  message?: string;
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<ApiErrorData>(error)) {
    return error.response?.data?.error || error.response?.data?.message || fallback;
  }
  return fallback;
};

export function Admin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [roleModal, setRoleModal] = useState<{ isOpen: boolean; userId: string; userName: string; currentRole: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string; userName: string } | null>(null);
  const [transferModal, setTransferModal] = useState<{ isOpen: boolean; userId: string; userName: string } | null>(null);
  const [transferPassword, setTransferPassword] = useState('');

  // Maintenance Settings
  const [mConfig, setMConfig] = useState<MaintenanceConfig>({
    isActive: false,
    status: 'PENDENTE',
    type: 'Sistema',
    clientName: '',
    equipment: '',
    description: '',
    estimatedTime: '',
    scheduledStart: null,
    durationHours: null,
    leadTimeHours: null,
  });
  const [isScheduled, setIsScheduled] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  const fetchMaintenanceConfig = useCallback(async () => {
    try {
      const response = await api.get('/maintenance');
      if (response.data?.maintenance) {
        const m = response.data.maintenance;
        setMConfig({
          isActive: m.isActive || false,
          status: m.status || (m.isActive ? 'EM_ANDAMENTO' : m.scheduledStart ? 'AGENDADA' : 'PENDENTE'),
          type: m.type || 'Sistema',
          clientName: m.clientName || '',
          equipment: m.equipment || '',
          description: m.description || '',
          estimatedTime: m.estimatedTime || '',
          scheduledStart: m.scheduledStart ? new Date(m.scheduledStart).toISOString().slice(0, 16) : null,
          durationHours: m.durationHours || null,
          leadTimeHours: m.leadTimeHours || null,
        });
        setIsScheduled(!!m.scheduledStart);
      }
    } catch (error) {
      console.error('Erro ao buscar config de manutenção:', error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMaintenanceConfig();
  }, [fetchMaintenanceConfig]);

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingMaintenance(true);
    try {
      const payload = {
        isActive: mConfig.isActive,
        status: mConfig.isActive ? 'EM_ANDAMENTO' : isScheduled ? 'AGENDADA' : mConfig.status,
        type: mConfig.type,
        clientName: mConfig.clientName,
        equipment: mConfig.equipment,
        description: mConfig.description,
        estimatedTime: mConfig.estimatedTime,
        scheduledStart: isScheduled ? mConfig.scheduledStart : null,
        durationHours: isScheduled ? mConfig.durationHours : null,
        leadTimeHours: isScheduled ? mConfig.leadTimeHours : null,
      };

      await api.post('/maintenance', payload);
      toast.success('Configurações de manutenção salvas!');
      fetchMaintenanceConfig();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Erro ao salvar configurações.'));
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const handleImmediateStop = async () => {
    setLoadingMaintenance(true);
    try {
      await api.post('/maintenance', {
        isActive: false,
        status: 'CANCELADA',
        type: mConfig.type,
        clientName: mConfig.clientName,
        equipment: mConfig.equipment,
        description: mConfig.description,
        estimatedTime: '',
        scheduledStart: null,
        durationHours: null,
        leadTimeHours: null,
      });
      toast.success('Manutenção encerrada!');
      fetchMaintenanceConfig();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Erro ao parar manutenção.'));
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const handleMaintenanceStatusChange = async (status: MaintenanceStatus) => {
    if (status === 'AGENDADA' && !mConfig.scheduledStart) {
      toast.error('Defina a data de início antes de marcar como agendada.');
      return;
    }

    setLoadingMaintenance(true);
    try {
      const nextIsScheduled = status === 'AGENDADA';
      await api.post('/maintenance', {
        isActive: status === 'EM_ANDAMENTO',
        status,
        type: mConfig.type,
        clientName: mConfig.clientName,
        equipment: mConfig.equipment,
        description: mConfig.description,
        estimatedTime: mConfig.estimatedTime,
        scheduledStart: nextIsScheduled ? mConfig.scheduledStart : null,
        durationHours: nextIsScheduled ? mConfig.durationHours : null,
        leadTimeHours: nextIsScheduled ? mConfig.leadTimeHours : null,
      });
      toast.success('Status da manutenção atualizado.');
      setMConfig(prev => ({
        ...prev,
        status,
        isActive: status === 'EM_ANDAMENTO',
        scheduledStart: nextIsScheduled ? prev.scheduledStart : null,
        durationHours: nextIsScheduled ? prev.durationHours : null,
        leadTimeHours: nextIsScheduled ? prev.leadTimeHours : null,
      }));
      setIsScheduled(nextIsScheduled);
      fetchMaintenanceConfig();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar status da manutenção.'));
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    }
  });

  const { data: users, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: string }) => {
      const response = await api.patch(`/admin/users/${id}/role`, { role });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-users'], (oldUsers: AdminUser[] | undefined) => {
        if (!oldUsers) return [];
        return oldUsers.map(u => u.id === data.user.id ? { ...u, role: data.user.role } : u);
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Conta removida com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao remover conta.'));
    }
  });

  const transferOwnershipMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password?: string }) => {
      const response = await api.post(`/admin/users/${id}/transfer-ownership`, { password });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      // Reload page to reflect lost ownership status in UI fully
      setTimeout(() => window.location.reload(), 1500);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao transferir posse.'));
    }
  });

  const handleRoleToggle = (userId: string, userName: string, currentRole: string) => {
    setRoleModal({ isOpen: true, userId, userName, currentRole });
  };

  const confirmRoleChange = () => {
    if (!roleModal) return;
    const newRole = roleModal.currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    updateRoleMutation.mutate({ id: roleModal.userId, role: newRole }, {
      onSuccess: () => setRoleModal(null)
    });
  };

  const confirmDeleteUser = () => {
    if (!deleteModal) return;
    deleteUserMutation.mutate(deleteModal.userId, {
      onSuccess: () => setDeleteModal(null)
    });
  };

  const confirmTransferOwnership = () => {
    if (!transferModal) return;
    if (!transferPassword) {
      toast.error('Por favor, introduza a palavra-passe.');
      return;
    }
    transferOwnershipMutation.mutate({ id: transferModal.userId, password: transferPassword }, {
      onSuccess: () => {
        setTransferModal(null);
        setTransferPassword('');
      }
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(value);
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return 'Sem data definida';
    return new Intl.DateTimeFormat('pt-MZ', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const getEffectiveMaintenanceStatus = (maintenance: MaintenanceConfig): MaintenanceStatus => {
    if (maintenance.isActive) return 'EM_ANDAMENTO';
    if (maintenance.status === 'CANCELADA' || maintenance.status === 'CONCLUIDA') return maintenance.status;
    if (!maintenance.scheduledStart) return maintenance.status || 'PENDENTE';

    const start = new Date(maintenance.scheduledStart);
    const now = new Date();
    if (start > now) return 'AGENDADA';

    if (maintenance.durationHours) {
      const end = new Date(start.getTime() + maintenance.durationHours * 60 * 60 * 1000);
      return now <= end ? 'EM_ANDAMENTO' : 'CONCLUIDA';
    }

    return 'EM_ANDAMENTO';
  };

  const statusConfig: Record<MaintenanceStatus, {
    label: string;
    className: string;
    icon: typeof Clock;
  }> = {
    PENDENTE: {
      label: 'Pendente',
      className: 'bg-slate-500/15 text-slate-500 border-slate-500/25',
      icon: Clock,
    },
    AGENDADA: {
      label: 'Agendada',
      className: 'bg-blue-500/15 text-blue-500 border-blue-500/25',
      icon: CalendarClock,
    },
    EM_ANDAMENTO: {
      label: 'Em andamento',
      className: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
      icon: PlayCircle,
    },
    CONCLUIDA: {
      label: 'Concluída',
      className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
      icon: CheckCircle2,
    },
    CANCELADA: {
      label: 'Cancelada',
      className: 'bg-red-500/15 text-red-500 border-red-500/25',
      icon: XCircle,
    },
  };

  const effectiveMaintenanceStatus = getEffectiveMaintenanceStatus(mConfig);
  const currentStatusConfig = statusConfig[effectiveMaintenanceStatus];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black italic tracking-tight flex items-center gap-2">
          <ShieldAlert className="text-primary" size={32} />
          PAINEL ADMIN
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-muted">Movimentação Global</h3>
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
              <ShieldCheck size={20} />
            </div>
          </div>
          {statsLoading ? (
            <div className="h-10 bg-secondary animate-pulse rounded-lg mt-2"></div>
          ) : (
            <>
              <p className="text-4xl font-black text-foreground">
                {formatCurrency(stats?.totalSalesValue || 0)}
              </p>
              <p className="text-sm font-medium text-emerald-500 mt-2">Valor total em vendas de todos os usuários</p>
            </>
          )}
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-muted">Total de Usuários</h3>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
              <Users size={20} />
            </div>
          </div>
          {usersLoading ? (
            <div className="h-10 bg-secondary animate-pulse rounded-lg mt-2"></div>
          ) : (
            <>
              <p className="text-4xl font-black text-foreground">
                {users?.length || 0}
              </p>
              <p className="text-sm font-medium text-emerald-500 mt-2">Usuários cadastrados no sistema</p>
            </>
          )}
        </div>
      </div>

      <section className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 min-w-0 overflow-hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Wrench className="text-amber-500" size={20} />
              Controle de Manutenção
            </h3>
            <p className="text-sm text-muted mt-1">Define estado e agendamento global.</p>
          </div>
          <span className={`w-fit border text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${currentStatusConfig.className}`}>
            {currentStatusConfig.label}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/25 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase text-muted">Estado</p>
              <p className="mt-1 font-bold text-foreground">{currentStatusConfig.label}</p>
            </div>
            {mConfig.scheduledStart && (
              <div>
                <p className="text-xs font-bold uppercase text-muted">Inicio</p>
                <p className="mt-1 font-bold text-foreground">{formatDateTime(mConfig.scheduledStart)}</p>
              </div>
            )}
            {mConfig.estimatedTime && (
              <div>
                <p className="text-xs font-bold uppercase text-muted">Tempo estimado</p>
                <p className="mt-1 font-bold text-foreground">{mConfig.estimatedTime}</p>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSaveMaintenance} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest block ml-1">Titulo</label>
              <input
                type="text"
                placeholder="Sistema"
                value={mConfig.type}
                onChange={(e) => setMConfig(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-secondary border border-border p-3 rounded-2xl outline-none focus:border-primary/50 text-foreground text-sm font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest block ml-1">Descrição</label>
              <textarea
                rows={3}
                placeholder="Impacto esperado"
                value={mConfig.description}
                onChange={(e) => setMConfig(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-secondary border border-border p-3 rounded-2xl outline-none focus:border-primary/50 text-foreground text-sm font-medium resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-secondary/40 border border-border rounded-2xl flex items-center justify-between min-w-0 gap-3">
                <div>
                  <label className="font-bold text-sm text-foreground block cursor-pointer" htmlFor="isActiveV2">Manutenção imediata</label>
                  <span className="text-xs text-muted block">Ativa o modo de manutencao</span>
                </div>
                <input
                  type="checkbox"
                  id="isActiveV2"
                  checked={mConfig.isActive}
                  onChange={(e) => setMConfig(prev => ({ ...prev, isActive: e.target.checked, status: e.target.checked ? 'EM_ANDAMENTO' : prev.status }))}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </div>

              <div className="p-3 bg-secondary/40 border border-border rounded-2xl flex items-center justify-between min-w-0 gap-3">
                <div>
                  <label className="font-bold text-sm text-foreground block cursor-pointer" htmlFor="isScheduledV2">Agendar manutenção futura</label>
                  <span className="text-xs text-muted block">Mostra aviso antes do inicio</span>
                </div>
                <input
                  type="checkbox"
                  id="isScheduledV2"
                  checked={isScheduled}
                  onChange={(e) => {
                    setIsScheduled(e.target.checked);
                    setMConfig(prev => ({ ...prev, status: e.target.checked ? 'AGENDADA' : prev.status }));
                  }}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-2 min-w-0">
              <label className="text-xs font-bold text-muted uppercase tracking-widest block ml-1">Início</label>
              <div className="date-input-shell bg-secondary border border-border rounded-2xl focus-within:border-primary/50 transition-colors">
                <input
                  type="datetime-local"
                  value={mConfig.scheduledStart || ''}
                  onChange={(e) => setMConfig(prev => ({ ...prev, scheduledStart: e.target.value }))}
                  required={isScheduled}
                  className="h-11 px-3 outline-none text-foreground text-xs font-medium"
                />
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <label className="text-xs font-bold text-muted uppercase tracking-widest block ml-1">Duração</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                placeholder="Horas"
                value={mConfig.durationHours || ''}
                onChange={(e) => setMConfig(prev => ({ ...prev, durationHours: e.target.value ? Number(e.target.value) : null }))}
                className="w-full bg-secondary border border-border p-3 rounded-2xl outline-none focus:border-primary/50 text-foreground text-sm font-medium"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <label className="text-xs font-bold text-muted uppercase tracking-widest block ml-1">Aviso prévio</label>
              <input
                type="number"
                min="1"
                placeholder="Horas antes"
                value={mConfig.leadTimeHours || ''}
                onChange={(e) => setMConfig(prev => ({ ...prev, leadTimeHours: e.target.value ? Number(e.target.value) : null }))}
                className="w-full bg-secondary border border-border p-3 rounded-2xl outline-none focus:border-primary/50 text-foreground text-sm font-medium"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <label className="text-xs font-bold text-muted uppercase tracking-widest block ml-1">Tempo estimado</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="text"
                  placeholder="Ex: 2 horas"
                  value={mConfig.estimatedTime}
                  onChange={(e) => setMConfig(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  className="w-full bg-secondary border border-border p-3 pl-11 rounded-2xl outline-none focus:border-primary/50 text-foreground text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 pt-4 border-t border-border/50">
            <div className="grid grid-cols-2 sm:flex gap-2">
              {(['PENDENTE', 'AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'] as MaintenanceStatus[]).map(status => {
                const StatusIcon = statusConfig[status].icon;
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={loadingMaintenance || (status === 'AGENDADA' && !mConfig.scheduledStart)}
                    onClick={() => handleMaintenanceStatusChange(status)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 ${statusConfig[status].className}`}
                  >
                    <StatusIcon size={14} />
                    {statusConfig[status].label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
              {(mConfig.isActive || mConfig.scheduledStart) && (
                <button type="button" onClick={handleImmediateStop} disabled={loadingMaintenance} className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  <Square size={16} />
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={loadingMaintenance} className="px-4 py-3 bg-primary hover:bg-emerald-500 text-black rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
                <Save size={16} />
                {loadingMaintenance ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>

      </section>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-primary" size={24} />
            Gestão de Usuários
          </h2>
        </div>
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto pb-2">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead>
              <tr className="bg-secondary/50 text-muted text-sm font-semibold">
                <th className="p-4 rounded-tl-xl">Nome</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Frangos Ativos</th>
                <th className="p-4 text-center">Lotes</th>
                <th className="p-4 text-center">Vendas</th>
                <th className="p-4 text-center">Cargo</th>
                <th className="p-4 text-center rounded-tr-xl">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {usersLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">Carregando usuários...</td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                users?.map(u => (
                  <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-bold">
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.isFirstAdmin && (
                          <span className="bg-amber-500/25 text-amber-500 border border-amber-500/40 text-[9px] px-1.5 py-0.5 rounded-lg font-black uppercase">
                            Dono
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted text-sm">{u.email}</td>
                    <td className="p-4 text-center font-bold text-emerald-500">{u.totalChickens || 0}</td>
                    <td className="p-4 text-center">{u._count.batches}</td>
                    <td className="p-4 text-center">{u._count.sales}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${u.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRoleToggle(u.id, u.name, u.role)}
                          disabled={updateRoleMutation.isPending || u.id === user?.id || u.isFirstAdmin}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs bg-secondary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1"
                          title={u.role === 'ADMIN' ? 'Rebaixar para Usuário' : 'Promover a Administrador'}
                        >
                          <Shield size={14} />
                        </button>

                        {/* Se o current user for o Dono, mostra a opção de transferir dono */}
                        {users?.find(usr => usr.id === user?.id)?.isFirstAdmin && !u.isFirstAdmin && u.id !== user?.id && (
                          <button
                            onClick={() => setTransferModal({ isOpen: true, userId: u.id, userName: u.name })}
                            disabled={transferOwnershipMutation.isPending}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs bg-secondary hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1"
                            title="Tornar este usuário o novo Dono"
                          >
                            <ArrowRightLeft size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteModal({ isOpen: true, userId: u.id, userName: u.name })}
                          disabled={deleteUserMutation.isPending || u.id === user?.id || u.isFirstAdmin}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs bg-secondary hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1"
                          title="Remover Conta"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="grid grid-cols-1 gap-4 md:hidden p-4">
          {usersLoading ? (
            <div className="p-8 text-center text-muted">Carregando usuários...</div>
          ) : users?.length === 0 ? (
            <div className="p-8 text-center text-muted">Nenhum usuário encontrado.</div>
          ) : (
            users?.map(u => (
              <div key={u.id} className="bg-secondary/20 border border-border rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground text-sm">{u.name}</p>
                      {u.isFirstAdmin && (
                        <span className="bg-amber-500/25 text-amber-500 border border-amber-500/40 text-[8px] px-1.5 py-0.5 rounded-lg font-black uppercase">
                          Dono
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted'
                    }`}>
                    {u.role}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Frangos</p>
                    <p className="font-black text-emerald-500 text-lg">{u.totalChickens || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Lotes</p>
                    <p className="font-bold text-foreground text-lg">{u._count.batches}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Vendas</p>
                    <p className="font-bold text-foreground text-lg">{u._count.sales}</p>
                  </div>
                </div>

                <div className="pt-1 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRoleToggle(u.id, u.name, u.role)}
                      disabled={updateRoleMutation.isPending || u.id === user?.id || u.isFirstAdmin}
                      className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-secondary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Shield size={16} />
                      {u.role === 'ADMIN' ? 'Rebaixar' : 'Promover'}
                    </button>

                    {users?.find(usr => usr.id === user?.id)?.isFirstAdmin && !u.isFirstAdmin && u.id !== user?.id && (
                      <button
                        onClick={() => setTransferModal({ isOpen: true, userId: u.id, userName: u.name })}
                        disabled={transferOwnershipMutation.isPending}
                        className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-secondary hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        title="Transferir Posse"
                      >
                        <ArrowRightLeft size={16} /> Dono
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, userId: u.id, userName: u.name })}
                    disabled={deleteUserMutation.isPending || u.id === user?.id || u.isFirstAdmin}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-secondary hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Excluir Conta
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      <AnimatePresence>
        {roleModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={fastTransition}
              onClick={() => setRoleModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={motionTransition}
              className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] bg-card border border-border rounded-3xl p-6 shadow-2xl overflow-y-auto overflow-x-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={() => setRoleModal(null)}
                  className="p-2 bg-secondary rounded-full text-muted hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="text-xl font-black mb-2 text-foreground">Atenção Necessária!</h3>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Você está prestes a mudar as permissões do usuário <strong className="text-foreground">{roleModal.userName}</strong>.
                <br /><br />
                {roleModal.currentRole === 'ADMIN' ? (
                  <span>Ele deixará de ser Administrador e <strong>perderá acesso</strong> a este painel e à visão global do sistema.</span>
                ) : (
                  <span>Ele passará a ser Administrador e <strong>terá acesso total</strong> a todos os relatórios, finanças e gestão de usuários.</span>
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setRoleModal(null)}
                  className="flex-1 px-4 py-3 bg-secondary rounded-xl font-bold text-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRoleChange}
                  disabled={updateRoleMutation.isPending}
                  className="flex-1 px-4 py-3 bg-primary rounded-xl font-black text-black shadow-lg shadow-primary/20 transition-colors disabled:opacity-50"
                >
                  {updateRoleMutation.isPending ? 'Aplicando...' : 'Sim, alterar permissão'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {deleteModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={fastTransition}
              onClick={() => setDeleteModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={motionTransition}
              className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] bg-card border border-border rounded-3xl p-6 shadow-2xl overflow-y-auto overflow-x-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>

              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Trash2 size={24} />
                </div>
                <button
                  onClick={() => setDeleteModal(null)}
                  className="p-2 bg-secondary rounded-full text-muted hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="text-xl font-black mb-2 text-foreground">Excluir Conta?</h3>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Você tem certeza que deseja excluir permanentemente o usuário <strong className="text-foreground">{deleteModal.userName}</strong>?
                <br /><br />
                Todos os lotes, registros de vendas e finanças associados a este usuário <strong>serão permanentemente apagados</strong> do banco de dados. Esta ação não pode ser desfeita.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 px-4 py-3 bg-secondary rounded-xl font-bold text-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={deleteUserMutation.isPending}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-black text-white shadow-lg shadow-red-500/20 transition-colors disabled:opacity-50"
                >
                  {deleteUserMutation.isPending ? 'Excluindo...' : 'Sim, Excluir Conta'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {transferModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={fastTransition}
              onClick={() => setTransferModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={motionTransition}
              className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] bg-card border border-border rounded-3xl p-6 shadow-2xl overflow-y-auto overflow-x-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>

              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <ArrowRightLeft size={24} />
                </div>
                <button
                  onClick={() => { setTransferModal(null); setTransferPassword(''); }}
                  className="p-2 bg-secondary rounded-full text-muted hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="text-xl font-black mb-2 text-foreground">Transferir Posse?</h3>

              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                Você está transferindo a posse de <strong>Dono</strong> para <strong className="text-foreground">{transferModal.userName}</strong>.
                <br /><br />
                Isto significa que você passará a ser um administrador comum e o usuário <strong>{transferModal.userName}</strong> passará a ser o único a deter direitos inalteráveis.
                <br /><br />
                Tem a certeza?
              </p>

              <div className="mb-6 space-y-2">
                <label className="text-xs font-black text-amber-500 uppercase tracking-wider block ml-1">Palavra-passe de Confirmação</label>
                <input
                  type="password"
                  placeholder="Digite a palavra-passe"
                  value={transferPassword}
                  onChange={(e) => setTransferPassword(e.target.value)}
                  className="w-full bg-secondary border border-border p-3.5 rounded-2xl outline-none focus:border-amber-500 text-foreground text-sm font-bold placeholder:text-muted/65 transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setTransferModal(null); setTransferPassword(''); }}
                  className="flex-1 px-4 py-3 bg-secondary rounded-xl font-bold text-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmTransferOwnership}
                  disabled={transferOwnershipMutation.isPending}
                  className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-black text-white shadow-lg shadow-amber-500/20 transition-colors disabled:opacity-50"
                >
                  {transferOwnershipMutation.isPending ? 'Transferindo...' : 'Sim, transferir Posse'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

