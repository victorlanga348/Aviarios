import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Shield, ShieldAlert, ShieldCheck, Users, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface AdminStats {
  totalSalesValue: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  totalChickens: number;
  _count: {
    batches: number;
    sales: number;
  };
}

export function Admin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [roleModal, setRoleModal] = useState<{ isOpen: boolean; userId: string; userName: string; currentRole: string } | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
    refetchInterval: 5000
  });

  const { data: users, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    },
    refetchInterval: 5000
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
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

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
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
                    <td className="p-4">{u.name}</td>
                    <td className="p-4 text-muted text-sm">{u.email}</td>
                    <td className="p-4 text-center font-bold text-emerald-500">{u.totalChickens || 0}</td>
                    <td className="p-4 text-center">{u._count.batches}</td>
                    <td className="p-4 text-center">{u._count.sales}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        u.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.name, u.role)}
                        disabled={updateRoleMutation.isPending || u.id === user?.id}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs bg-secondary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1 mx-auto"
                      >
                        <Shield size={14} />
                        {u.role === 'ADMIN' ? 'Rebaixar' : 'Promover'}
                      </button>
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
                    <p className="font-bold text-foreground text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    u.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted'
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

                <div className="pt-1">
                  <button
                    onClick={() => handleRoleToggle(u.id, u.name, u.role)}
                    disabled={updateRoleMutation.isPending || u.id === user?.id}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-secondary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Shield size={16} />
                    {u.role === 'ADMIN' ? 'Rebaixar para Usuário' : 'Promover a Administrador'}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRoleModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl overflow-hidden"
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
                  className="flex-1 px-4 py-3 bg-primary rounded-xl font-black text-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {updateRoleMutation.isPending ? 'Aplicando...' : 'Sim, alterar permissão'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
