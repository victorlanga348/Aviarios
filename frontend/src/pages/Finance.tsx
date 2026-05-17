import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useBatches } from '../hooks/useBatches';
import { LossModal } from '../components/Finance/LossModal';
import { FixedExpenseModal } from '../components/Finance/FixedExpenseModal';
import { BatchExpenseModal } from '../components/Finance/BatchExpenseModal';
import { Zap, Beef } from 'lucide-react';

export function Finance() {
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [isFixedExpenseModalOpen, setIsFixedExpenseModalOpen] = useState(false);
  const [isBatchExpenseModalOpen, setIsBatchExpenseModalOpen] = useState(false);
  
  const { batches } = useBatches();
  const { registerLoss, registerFixedExpense, registerBatchExpense, isProcessing } = useFinance();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-[2rem] border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <p className="text-primary font-black uppercase text-[10px] tracking-widest mb-1">Gestão de Fluxo</p>
          <h2 className="text-3xl font-black flex items-center gap-3 text-foreground">Financeiro e Custos</h2>
        </div>
        <div className="flex flex-wrap gap-4 relative z-10">
          <button 
            onClick={() => setIsBatchExpenseModalOpen(true)}
            className="bg-primary hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl flex items-center gap-2 font-black transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 text-xs uppercase tracking-widest"
          >
            <Beef size={18} /> Lançar Insumo
          </button>
          <button 
            onClick={() => setIsFixedExpenseModalOpen(true)}
            className="bg-secondary hover:bg-secondary/80 text-foreground px-6 py-4 rounded-2xl flex items-center gap-2 font-black transition-all backdrop-blur-md hover:scale-105 active:scale-95 text-xs uppercase tracking-widest border border-border"
          >
            <Zap size={18} /> Conta Mensal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Despesa Fixa Rápida */}
        <div className="bg-card border border-border p-8 rounded-[2rem] shadow-xl hover:border-yellow-500/30 transition-all group">
          <div className="flex items-center justify-between mb-8">
            <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-lg shadow-yellow-500/5 group-hover:scale-110 transition-transform">
              <Zap size={32} />
            </div>
            <div className="text-right">
              <p className="text-muted text-[10px] uppercase font-black tracking-widest">Categoria</p>
              <p className="text-foreground font-bold">Operacional</p>
            </div>
          </div>
          <h3 className="text-xl font-black text-foreground mb-2">Contas Mensais</h3>
          <p className="text-muted text-sm mb-8 leading-relaxed">Gerencie gastos recorrentes como luz, água, internet e manutenção básica das instalações.</p>
          <button 
            onClick={() => setIsFixedExpenseModalOpen(true)}
            className="w-full py-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors text-foreground text-sm font-bold border border-border"
          >
            Lançar Conta Mensal
          </button>
        </div>

        {/* Card Insumos de Lote */}
        <div className="bg-card border border-border p-8 rounded-[2rem] shadow-xl hover:border-primary/30 transition-all group">
          <div className="flex items-center justify-between mb-8">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5 group-hover:scale-110 transition-transform">
              <Beef size={32} />
            </div>
            <div className="text-right">
              <p className="text-muted text-[10px] uppercase font-black tracking-widest">Categoria</p>
              <p className="text-foreground font-bold">Insumos</p>
            </div>
          </div>
          <h3 className="text-xl font-black text-foreground mb-2">Ração e Vacinas</h3>
          <p className="text-muted text-sm mb-8 leading-relaxed">Registre a compra de ração, medicamentos e vacinas que são aplicados diretamente em um lote específico.</p>
          <button 
            onClick={() => setIsBatchExpenseModalOpen(true)}
            className="w-full py-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors text-foreground text-sm font-bold border border-border"
          >
            Registrar Insumo de Lote
          </button>
        </div>
      </div>

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
    </div>
  );
}
