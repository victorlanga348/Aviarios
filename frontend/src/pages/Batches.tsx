import { useState } from 'react';
import { useBatches } from '../hooks/useBatches';
import { CreateBatchModal } from '../components/Batches/CreateBatchModal';
import { Plus, Package, Calendar } from 'lucide-react';

export function Batches() {
  const { batches, isLoading, createBatch, isLoading: isCreating, updateBatchStatus, isUpdatingStatus } = useBatches();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Package className="text-primary" /> Gestão de Lotes
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex justify-center items-center gap-2 bg-primary hover:bg-emerald-600 text-white px-4 py-3 sm:py-2 rounded-xl font-bold shadow-[var(--shadow)] active:scale-95 transition-all"
        >
          <Plus size={20} /> Novo Lote
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card/50 border border-border p-6 rounded-xl animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-secondary rounded-lg"></div>
                <div className="w-16 h-6 bg-secondary rounded"></div>
              </div>
              <div className="w-3/4 h-5 bg-secondary/80 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-secondary rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <div className="w-16 h-3 bg-secondary rounded mb-1"></div>
                  <div className="w-20 h-4 bg-secondary/80 rounded"></div>
                </div>
                <div>
                  <div className="w-16 h-3 bg-secondary rounded mb-1"></div>
                  <div className="w-12 h-4 bg-secondary/80 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {batches.map(batch => (
            <div key={batch.id} className="bg-card/50 border border-border p-6 rounded-xl hover:border-primary/50 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/20 p-3 rounded-lg text-primary">
                  <Package size={24} />
                </div>
                <button 
                  onClick={() => updateBatchStatus({ id: batch.id, status: batch.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE' })}
                  disabled={isUpdatingStatus || (batch.status === 'CLOSED' && batch.actualQuantity <= 0)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed ${
                    batch.status === 'ACTIVE' 
                      ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20'
                  }`}
                  title={
                    batch.status === 'ACTIVE' 
                      ? 'Clique para fechar o lote' 
                      : batch.actualQuantity <= 0 
                        ? 'Lote sem aves não pode ser reaberto' 
                        : 'Clique para reabrir o lote'
                  }
                >
                  {batch.status === 'ACTIVE' ? 'Ativo' : 'Fechado'}
                </button>
              </div>
              
              <h3 className="text-lg font-bold mb-1">{batch.name}</h3>
              <div className="flex items-center gap-2 text-muted text-sm mb-4">
                <Calendar size={14} />
                {new Date(batch.startDate).toLocaleDateString()}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted uppercase">Qtd Inicial</p>
                  <p className="font-bold">{batch.initialQuantity} aves</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase">Saldo Atual</p>
                  <p className="font-bold text-primary">{batch.actualQuantity ?? batch.initialQuantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateBatchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={createBatch} 
        isLoading={isCreating}
      />
    </div>
  );
}