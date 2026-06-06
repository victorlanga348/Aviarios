import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Shield, ShieldAlert, ShieldCheck, Users, AlertTriangle, X, Clock, Square, Save, Trash2, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { fastTransition, feedbackVariants, modalVariants, motionTransition, overlayVariants } from '../lib/animations';

interface MaintenanceConfig {
  isActive: boolean;
  estimatedTime: string;
  scheduledStart: string | null;
  durationHours: number | null;
  leadTimeHours: number | null;
}

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
        estimatedTime: mConfig.estimatedTime,
        scheduledStart: isScheduled ? mConfig.scheduledStart : null,
        durationHours: isScheduled ? mConfig.durationHours : null,
        leadTimeHours: isScheduled ? mConfig.leadTimeHours : null,
      };

      await api.post('/maintenance', payload);
      toast.success('Configurações de manutenção salvas!');
      setIsScheduled(false); // fecha o painel de agendamento após salvar
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


      {/* Maintenance Config Card */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <AlertTriangle className="text-amber-500" size={20} />
            Controle de Manutenção
          </h3>
          {mConfig.isActive && (
            <span className="bg-red-500/25 text-red-500 border border-red-500/40 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider animate-pulse">
              Em Manutenção
            </span>
          )}
          {!mConfig.isActive && mConfig.scheduledStart && (
            <span className="bg-blue-500/25 text-blue-500 border border-blue-500/40 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
              Agendada
            </span>
          )}
        </div>

        <form onSubmit={handleSaveMaintenance} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 p-4 bg-secondary/40 border border-border rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <label className="font-bold text-sm text-foreground block cursor-pointer" htmlFor="isActive">
                  Manutenção Imediata
                </label>
                <span className="text-xs text-muted block">Bloqueia o acesso de todos os usuários comuns agora</span>
              </div>
              <input
                type="checkbox"
                id="isActive"
                checked={mConfig.isActive}
                onChange={(e) => setMConfig(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
            <div className="space-y-2 min-w-0">
              <label className="text-xs font-bold text-muted uppercase tracking-widest block ml-1">Tempo Estimado (opcional)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Ex: 2 horas, 45 minutos"
                  value={mConfig.estimatedTime}
                  onChange={(e) => setMConfig(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  className="w-full bg-secondary border border-border p-3 pl-12 rounded-2xl outline-none focus:border-primary/50 text-foreground text-sm font-medium"
                />
              </div>
            </div>

            <div className="p-3 bg-secondary/40 border border-border rounded-2xl flex items-center justify-between self-end min-h-[50px] min-w-0 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-sm text-foreground block cursor-pointer" htmlFor="isScheduled">
                  Agendar Manutenção Futura
                </label>
              </div>
              <input
                type="checkbox"
                id="isScheduled"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="w-5 h-5 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>

          {isScheduled && (
            <motion.div
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={fastTransition}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 min-w-0"
            >
              <div className="space-y-2 min-w-0">
                <label className="text-xs font-bold text-muted uppercase tracking-widest block ml-1">Início da Manutenção</label>
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
                <label className="text-xs font-bold text-muted uppercase tracking-widest block ml-1">Duração em Horas (opcional)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="Ex: 2.5"
                  value={mConfig.durationHours || ''}
                  onChange={(e) => setMConfig(prev => ({ ...prev, durationHours: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full bg-secondary border border-border p-3 rounded-2xl outline-none focus:border-primary/50 text-foreground text-sm font-medium min-w-0"
                />
              </div>

              <div className="space-y-2 min-w-0">
                <label className="text-xs font-bold text-muted uppercase tracking-widest block ml-1">Aviso Prévio em Horas (opcional)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex: 24 (1 dia antes)"
                  value={mConfig.leadTimeHours || ''}
                  onChange={(e) => setMConfig(prev => ({ ...prev, leadTimeHours: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full bg-secondary border border-border p-3 rounded-2xl outline-none focus:border-primary/50 text-foreground text-sm font-medium min-w-0"
                />
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
            {(mConfig.isActive || mConfig.scheduledStart) && (
              <button
                type="button"
                onClick={handleImmediateStop}
                disabled={loadingMaintenance}
                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Square size={16} />
                {mConfig.isActive ? 'Parar Manutenção Imediatamente' : 'Cancelar Agendamento'}
              </button>
            )}
            <button
              type="submit"
              disabled={loadingMaintenance}
              className="flex-1 px-4 py-3 bg-primary hover:bg-emerald-500 text-black rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {loadingMaintenance ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>

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
