import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useBatches } from '../hooks/useBatches';
import { LossModal } from '../components/Finance/LossModal';
import { FixedExpenseModal } from '../components/Finance/FixedExpenseModal';
import { BatchExpenseModal } from '../components/Finance/BatchExpenseModal';
import { DeleteConfirmModal } from '../components/Finance/DeleteConfirmModal';
import { Zap, Beef, Trash2, Calendar, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { cardListVariants, motionTransition, tableRowVariants } from '../lib/animations';

export function Finance() {
  const queryClient = useQueryClient();
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [isFixedExpenseModalOpen, setIsFixedExpenseModalOpen] = useState(false);
  const [isBatchExpenseModalOpen, setIsBatchExpenseModalOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'FIXED' | 'BATCH'>('FIXED');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [expenseToDelete, setExpenseToDelete] = useState<{ id: string; description: string; amount: number; type: 'FIXED' | 'BATCH' } | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const { batches } = useBatches();
  const { 
    registerLoss, 
    registerFixedExpense, 
    registerBatchExpense, 
    removeFixedExpense,
    removeBatchExpense,
    fixedExpensesData,
    isLoadingExpenses,
    isProcessing 
  } = useFinance(selectedMonth, selectedYear);

  const activeBatchId = selectedBatchId || batches[0]?.id || '';

  const { data: batchExpenses = [], isLoading: isLoadingBatchExpenses } = useQuery({
    queryKey: ['batch-expenses', activeBatchId],
    queryFn: async () => {
      if (!activeBatchId) return [];
      const response = await api.get(`/batch-expenses/${activeBatchId}`);
      return response.data as Array<{
        id: string;
        type: 'RACAO' | 'VACINA';
        amount: number;
        description: string | null;
        createdAt: string;
      }>;
    },
    enabled: !!activeBatchId
  });

  const totalRacao = batchExpenses
    .filter(e => e.type === 'RACAO')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalVacina = batchExpenses
    .filter(e => e.type === 'VACINA')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalBatch = totalRacao + totalVacina;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">Financeiro</h2>
          <p className="text-sm text-muted mt-1">Contas mensais e insumos por lote.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsBatchExpenseModalOpen(true)}
            className="bg-primary hover:bg-emerald-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 font-bold transition-colors text-sm"
          >
            <Beef size={18} /> Novo insumo
          </button>
          <button 
            onClick={() => setIsFixedExpenseModalOpen(true)}
            className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-3 rounded-xl flex items-center gap-2 font-bold transition-colors text-sm border border-border"
          >
            <Zap size={18} /> Nova conta
          </button>
        </div>
      </div>

      {/* Abas de Navegação das Contas/Custos */}
      <div className="flex bg-secondary/35 p-1.5 rounded-2xl border border-border/80 max-w-md">
        <button
          onClick={() => setActiveTab('FIXED')}
          className={`flex-1 py-3 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'FIXED'
              ? 'bg-card text-foreground border border-border'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Zap size={14} /> Contas Mensais
        </button>
        <button
          onClick={() => setActiveTab('BATCH')}
          className={`flex-1 py-3 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'BATCH'
              ? 'bg-card text-foreground border border-border'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Beef size={14} /> Insumos de Lotes
        </button>
      </div>

      {activeTab === 'FIXED' ? (
        /* Lista de Contas Mensais Detalhadas */
        <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:grid md:grid-cols-3 md:items-center gap-6 mb-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <Calendar className="text-primary" size={20} /> Detalhamento de Contas Mensais
              </h3>
              <p className="text-muted text-xs mt-1">Custos fixos do mês selecionado.</p>
            </div>
            <div className="md:col-span-1 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 min-w-0">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-secondary border border-border text-foreground px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider outline-none focus:border-primary transition-all w-full md:w-auto min-w-0"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('pt-PT', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-secondary border border-border text-foreground px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider outline-none focus:border-primary transition-all w-full md:w-auto min-w-0"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const yearOption = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="hidden md:block md:col-span-1"></div>
          </div>

          {/* Resumo Rápido */}
          {fixedExpensesData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-secondary/40 p-5 rounded-2xl border border-border flex flex-col justify-center">
                <p className="text-muted text-[9px] uppercase font-black tracking-widest mb-1">Total</p>
                <p className="text-xl min-[360px]:text-2xl font-black text-foreground break-words">
                  {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(fixedExpensesData.total)}
                </p>
              </div>
              <div className="bg-secondary/40 p-5 rounded-2xl border border-border flex flex-col justify-center">
                <p className="text-muted text-[9px] uppercase font-black tracking-widest mb-1">Média diária</p>
                <p className="text-xl min-[360px]:text-2xl font-black text-primary break-words">
                  {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(fixedExpensesData.dailyValue)}
                </p>
              </div>
            </div>
          )}

          {/* Tabela ou estado vazio */}
          {isLoadingExpenses ? (
            <div className="py-16 text-center text-muted font-bold text-sm">Carregando lançamentos...</div>
          ) : !fixedExpensesData || fixedExpensesData.expenses.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
              <p className="text-muted text-sm font-bold">Nenhuma conta registrada para {new Date(2000, selectedMonth - 1).toLocaleString('pt-PT', { month: 'long' })} de {selectedYear}.</p>
            </div>
          ) : (
            <>
              {/* Visualização de Cards para telas pequenas (Mobile) */}
              <div className="md:hidden space-y-4">
                <AnimatePresence mode="popLayout">
                  {fixedExpensesData.expenses.map((expense) => (
                    <motion.div 
                      key={expense.id} 
                      layout
                      variants={cardListVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={motionTransition}
                      className="bg-secondary/20 p-5 rounded-2xl border border-border flex justify-between items-center relative group"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-foreground text-sm leading-tight">{expense.description}</p>
                        <p className="text-muted text-[10px] uppercase font-black tracking-wider">
                          {new Date(expense.date).toLocaleDateString('pt-PT')}
                        </p>
                        <p className="font-black text-primary text-base pt-1">
                          {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(expense.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpenseToDelete({ id: expense.id, description: expense.description, amount: expense.amount, type: 'FIXED' })}
                        className="p-3 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Remover Despesa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Tabela Tradicional para Telas Maiores (Desktop) */}
              <div className="hidden md:block overflow-x-auto rounded-xl">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border text-muted text-[9px] uppercase font-black tracking-widest">
                      <th className="pb-4">Descrição</th>
                      <th className="pb-4">Data de Lançamento</th>
                      <th className="pb-4 text-right">Valor</th>
                      <th className="pb-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <AnimatePresence mode="popLayout">
                      {fixedExpensesData.expenses.map((expense) => (
                        <motion.tr 
                          key={expense.id} 
                          layout
                          variants={tableRowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={motionTransition}
                          className="hover:bg-secondary/20 transition-colors group"
                        >
                          <td className="py-4 font-bold text-foreground text-sm">{expense.description}</td>
                          <td className="py-4 text-muted text-xs">
                            {new Date(expense.date).toLocaleDateString('pt-PT')}
                          </td>
                          <td className="py-4 font-black text-foreground text-sm text-right">
                            {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(expense.amount)}
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => setExpenseToDelete({ id: expense.id, description: expense.description, amount: expense.amount, type: 'FIXED' })}
                              className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Remover Despesa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Lista de Insumos (Ração e Vacina) de Lotes Detalhadas */
        <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:grid md:grid-cols-3 md:items-center gap-6 mb-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <ClipboardList className="text-primary" size={20} /> Detalhamento de Insumos do Lote
              </h3>
              <p className="text-muted text-xs mt-1">Custos de ração, medicamentos e vacinas por lote.</p>
            </div>
            <div className="md:col-span-1 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 min-w-0">
              <span className="text-muted text-[10px] uppercase font-black tracking-wider hidden sm:inline">Lote:</span>
              <select
                value={activeBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="bg-secondary border border-border text-foreground px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider outline-none focus:border-primary transition-all w-full md:w-auto min-w-0"
              >
                {batches.length === 0 ? (
                  <option value="">Nenhum Lote Encontrado</option>
                ) : (
                  batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.status === 'ACTIVE' ? 'Ativo' : 'Fechado'})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="hidden md:block md:col-span-1"></div>
          </div>

          {/* Resumo Rápido de Custos de Insumo */}
          {activeBatchId && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-secondary/40 p-5 rounded-2xl border border-border flex flex-col justify-center">
                <p className="text-muted text-[9px] uppercase font-black tracking-widest mb-1">Total de Insumos</p>
                <p className="text-xl min-[360px]:text-2xl font-black text-foreground break-words">
                  {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(totalBatch)}
                </p>
              </div>
              <div className="bg-secondary/40 p-5 rounded-2xl border border-border flex flex-col justify-center">
                <p className="text-muted text-[9px] uppercase font-black tracking-widest mb-1">Ração Consumida</p>
                <p className="text-xl min-[360px]:text-2xl font-black text-primary break-words">
                  {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(totalRacao)}
                </p>
              </div>
              <div className="bg-secondary/40 p-5 rounded-2xl border border-border flex flex-col justify-center">
                <p className="text-muted text-[9px] uppercase font-black tracking-widest mb-1">Medicamentos e Vacinas</p>
                <p className="text-xl min-[360px]:text-2xl font-black text-yellow-500 break-words">
                  {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(totalVacina)}
                </p>
              </div>
            </div>
          )}

          {/* Tabela ou estado vazio */}
          {isLoadingBatchExpenses ? (
            <div className="py-16 text-center text-muted font-bold text-sm">Carregando insumos do lote...</div>
          ) : !activeBatchId ? (
            <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
              <p className="text-muted text-sm font-bold">Por favor, selecione ou crie um lote para visualizar os insumos lançados.</p>
            </div>
          ) : batchExpenses.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
              <p className="text-muted text-sm font-bold">Nenhum custo com ração ou vacinas registrado para este lote.</p>
            </div>
          ) : (
            <>
              {/* Visualização de Cards para telas pequenas (Mobile) */}
              <div className="md:hidden space-y-4">
                <AnimatePresence mode="popLayout">
                  {batchExpenses.map((expense) => (
                    <motion.div 
                      key={expense.id} 
                      layout
                      variants={cardListVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={motionTransition}
                      className="bg-secondary/20 p-5 rounded-2xl border border-border flex justify-between items-center relative group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            expense.type === 'RACAO' 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                          }`}>
                            {expense.type === 'RACAO' ? 'Ração' : 'Vacina'}
                          </span>
                        </div>
                        <p className="font-bold text-foreground text-sm leading-tight pt-1">
                          {expense.description || (expense.type === 'RACAO' ? 'Ração' : 'Medicamento/Vacina')}
                        </p>
                        <p className="text-muted text-[10px] uppercase font-black tracking-wider">
                          {new Date(expense.createdAt).toLocaleDateString('pt-PT')}
                        </p>
                        <p className="font-black text-primary text-base pt-1">
                          {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(expense.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpenseToDelete({ id: expense.id, description: expense.description || (expense.type === 'RACAO' ? 'Ração' : 'Vacina'), amount: expense.amount, type: 'BATCH' })}
                        className="p-3 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Remover Despesa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Tabela Tradicional para Telas Maiores (Desktop) */}
              <div className="hidden md:block overflow-x-auto rounded-xl">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border text-muted text-[9px] uppercase font-black tracking-widest">
                      <th className="pb-4">Tipo</th>
                      <th className="pb-4">Descrição</th>
                      <th className="pb-4">Data de Lançamento</th>
                      <th className="pb-4 text-right">Valor</th>
                      <th className="pb-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <AnimatePresence mode="popLayout">
                      {batchExpenses.map((expense) => (
                        <motion.tr 
                          key={expense.id} 
                          layout
                          variants={tableRowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={motionTransition}
                          className="hover:bg-secondary/20 transition-colors group"
                        >
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                              expense.type === 'RACAO' 
                                ? 'bg-primary/10 text-primary border border-primary/20' 
                                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            }`}>
                              {expense.type === 'RACAO' ? 'Ração' : 'Vacina'}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-foreground text-sm">
                            {expense.description || (expense.type === 'RACAO' ? 'Compra de Ração' : 'Compra de Vacinas')}
                          </td>
                          <td className="py-4 text-muted text-xs">
                            {new Date(expense.createdAt).toLocaleDateString('pt-PT')}
                          </td>
                          <td className="py-4 font-black text-foreground text-sm text-right">
                            {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(expense.amount)}
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => setExpenseToDelete({ id: expense.id, description: expense.description || (expense.type === 'RACAO' ? 'Ração' : 'Vacina'), amount: expense.amount, type: 'BATCH' })}
                              className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Remover Despesa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      <LossModal 
        isOpen={isLossModalOpen}
        onClose={() => setIsLossModalOpen(false)}
        batches={batches}
        isLoading={isProcessing}
        onSubmit={async (data) => {
          await registerLoss(data);
          setIsLossModalOpen(false);
        }}
      />

      <FixedExpenseModal
        isOpen={isFixedExpenseModalOpen}
        onClose={() => setIsFixedExpenseModalOpen(false)}
        isLoading={isProcessing}
        onSubmit={async (data) => {
          await registerFixedExpense(data);
          setIsFixedExpenseModalOpen(false);
        }}
      />

      <BatchExpenseModal
        isOpen={isBatchExpenseModalOpen}
        onClose={() => setIsBatchExpenseModalOpen(false)}
        batches={batches}
        isLoading={isProcessing}
        onSubmit={async (data) => {
          await registerBatchExpense(data);
          setIsBatchExpenseModalOpen(false);
        }}
      />

      <DeleteConfirmModal
        isOpen={expenseToDelete !== null}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={async () => {
          if (expenseToDelete) {
            if (expenseToDelete.type === 'FIXED') {
              await removeFixedExpense(expenseToDelete.id);
            } else {
              await removeBatchExpense(expenseToDelete.id);
              queryClient.invalidateQueries({ queryKey: ['batch-expenses', activeBatchId] });
            }
            setExpenseToDelete(null);
          }
        }}
        isLoading={isProcessing}
        title={expenseToDelete?.type === 'FIXED' ? "Excluir Conta Mensal?" : "Excluir Insumo de Lote?"}
        description={expenseToDelete?.type === 'FIXED' ? "Você está prestes a excluir esta despesa operacional fixa de forma permanente." : "Você está prestes a excluir este insumo de lote (ração/vacina) de forma permanente."}
        itemName={expenseToDelete?.description}
        itemValue={expenseToDelete ? new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(expenseToDelete.amount) : undefined}
      />
    </div>
  );
}


