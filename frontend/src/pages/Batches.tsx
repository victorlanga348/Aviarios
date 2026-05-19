import { useState } from 'react';
import { useBatches } from '../hooks/useBatches';
import { CreateBatchModal } from '../components/Batches/CreateBatchModal';
import { DeleteBatchModal } from '../components/Batches/DeleteBatchModal';
import { RegisterLossModal } from '../components/Batches/RegisterLossModal';
import { LossHistoryModal } from '../components/Batches/LossHistoryModal';
import { Plus, Package, Calendar, Trash2, Skull, AlertTriangle, History } from 'lucide-react';
import type { Batch } from '../@types';
import { motion, AnimatePresence } from 'framer-motion';

export function Batches() {
  const { 
    batches, 
    isLoading, 
    createBatch, 
    isCreating, 
    updateBatchStatus, 
    isUpdatingStatus, 
    deleteBatch, 
    isDeleting,
    registerLoss,
    isRegisteringLoss,
    undoLoss,
    isUndoingLoss
  } = useBatches();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeleteBatch, setSelectedDeleteBatch] = useState<Batch | null>(null);
  const [selectedLossBatch, setSelectedLossBatch] = useState<Batch | null>(null);
  const [selectedHistoryBatch, setSelectedHistoryBatch] = useState<Batch | null>(null);

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card/50 border border-border p-6 sm:p-8 rounded-2xl sm:rounded-3xl animate-pulse">
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
      ) : batches.length === 0 ? (
        <div className="bg-card/30 border border-border p-12 rounded-3xl text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-5 my-12 backdrop-blur-sm">
          <div className="p-5 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-lg shadow-primary/5 animate-bounce">
            <Package size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Nenhum Lote Encontrado</h3>
            <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
              Você ainda não possui nenhum lote de aves cadastrado no sistema. Abra o seu primeiro lote de produção para começar a registrar suas vendas e despesas!
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-emerald-600 text-black font-black px-6 py-3.5 rounded-xl transition active:scale-95 shadow-lg shadow-primary/15"
          >
            <Plus size={20} />
            <span>Abrir Primeiro Lote</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {batches.map(batch => {
              // Calcular total de mortes e taxa de mortalidade
              const totalLosses = batch.losses?.reduce((sum, l) => sum + l.quantity, 0) || 0;
              const mortalityRate = batch.initialQuantity > 0 ? ((totalLosses / batch.initialQuantity) * 100) : 0;
              const isHighMortality = mortalityRate >= 8;
              const isWarningMortality = mortalityRate >= 5 && mortalityRate < 8;

              return (
                <motion.div 
                  key={batch.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -15, transition: { duration: 0.15 } }}
                  transition={{ type: 'spring', damping: 25, stiffness: 380 }}
                  className={`bg-card/50 border p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-primary/50 transition flex flex-col justify-between ${
                    isHighMortality ? 'border-rose-500/30' : 'border-border'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-lg ${isHighMortality ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/20 text-primary'}`}>
                        {isHighMortality ? <Skull size={24} /> : <Package size={24} />}
                      </div>
                      <div className="flex items-center gap-2">
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
                        <button
                          onClick={() => setSelectedDeleteBatch(batch)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/20 transition-all active:scale-90 disabled:opacity-50"
                          title="Excluir Lote"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-1">{batch.name}</h3>
                    <div className="flex items-center gap-2 text-muted text-sm mb-4">
                      <Calendar size={14} />
                      {new Date(batch.startDate).toLocaleDateString()}
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                      <div>
                        <p className="text-xs text-muted font-medium">Aves Compradas</p>
                        <p className="font-bold text-base text-foreground">{batch.initialQuantity} aves</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted font-medium">Aves Vivas Atuais</p>
                        <p className="font-bold text-base text-primary">{batch.actualQuantity ?? batch.initialQuantity} aves</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-border/50 pt-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted">Total de Mortes:</span>
                        <span className={`font-bold ${totalLosses > 0 ? 'text-rose-500' : 'text-foreground'}`}>{totalLosses} aves</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted">Taxa de Perda:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                          isHighMortality 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : isWarningMortality
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {mortalityRate.toFixed(1)}%
                        </span>
                      </div>

                      {/* Warnings Alert Badges */}
                      {isHighMortality && (
                        <div className="mt-2 p-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg border border-red-500/20 flex items-center justify-center gap-1.5 leading-relaxed">
                          <AlertTriangle size={14} className="shrink-0" />
                          <span>Alerta: Perda de aves muito alta!</span>
                        </div>
                      )}
                      {isWarningMortality && (
                        <div className="mt-2 p-2 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-lg border border-amber-500/20 flex items-center justify-center gap-1.5 leading-relaxed">
                          <AlertTriangle size={14} className="shrink-0" />
                          <span>Atenção: Mortes acima da média</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedLossBatch(batch)}
                      disabled={batch.status === 'CLOSED'}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white disabled:bg-secondary/80 disabled:text-muted rounded-xl transition text-sm font-bold flex items-center justify-center gap-2 active:scale-95 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-md"
                      title={batch.status === 'CLOSED' ? 'Lote fechado não registra mortes' : 'Registrar uma nova morte de ave'}
                    >
                      <Skull size={16} /> Registrar Morte
                    </button>
                    
                    <button
                      onClick={() => setSelectedHistoryBatch(batch)}
                      className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl transition text-xs font-semibold flex items-center justify-center gap-2 border border-border active:scale-95"
                      title="Ver todas as mortes já registradas e corrigir erros"
                    >
                      <History size={14} className="text-muted" /> Ver Histórico de Perdas
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <CreateBatchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={createBatch} 
        isLoading={isCreating}
      />

      <DeleteBatchModal
        isOpen={!!selectedDeleteBatch}
        onClose={() => setSelectedDeleteBatch(null)}
        onConfirm={() => {
          if (selectedDeleteBatch) {
            deleteBatch(selectedDeleteBatch.id);
          }
        }}
        isLoading={isDeleting}
        batchName={selectedDeleteBatch?.name ?? ''}
      />

      <RegisterLossModal
        isOpen={!!selectedLossBatch}
        onClose={() => setSelectedLossBatch(null)}
        onSubmit={registerLoss}
        isLoading={isRegisteringLoss}
        batch={selectedLossBatch}
      />

      <LossHistoryModal
        isOpen={!!selectedHistoryBatch}
        onClose={() => setSelectedHistoryBatch(null)}
        batch={batches.find(b => b.id === selectedHistoryBatch?.id) || null}
        onUndo={async (lossId) => {
          await undoLoss(lossId);
        }}
        isUndoing={isUndoingLoss}
      />
    </div>
  );
}