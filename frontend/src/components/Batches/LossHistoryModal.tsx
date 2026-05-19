import { useState } from 'react';
import { Skull, X, RotateCcw, Calendar, AlertCircle } from 'lucide-react';
import { DeleteConfirmModal } from '../Finance/DeleteConfirmModal';
import type { Batch, Loss } from '../../@types';

interface LossHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  onUndo: (lossId: string) => Promise<void>;
  isUndoing: boolean;
}

export function LossHistoryModal({ isOpen, onClose, batch, onUndo, isUndoing }: LossHistoryModalProps) {
  const [selectedLossToUndo, setSelectedLossToUndo] = useState<Loss | null>(null);

  if (!isOpen || !batch) return null;

  const losses = batch.losses || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className="relative bg-card border border-border rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16"></div>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/80 text-foreground rounded-2xl border border-border">
              <Skull size={24} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Histórico de Perdas (Mortes)</h3>
              <p className="text-muted text-xs mt-0.5">Lote: <span className="text-foreground font-semibold">{batch.name}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-secondary rounded-xl transition text-muted hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 relative z-10 scrollbar-thin">
          {losses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-secondary/20 flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Nenhuma perda registrada</p>
                <p className="text-xs text-muted mt-0.5">Este lote está com 100% de aproveitamento sanitário!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {losses.map((loss) => (
                <div 
                  key={loss.id}
                  className="p-4 bg-secondary/50 border border-border/80 rounded-2xl flex items-center justify-between gap-4 transition hover:bg-secondary/70 hover:border-border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-500 font-black text-sm">{loss.quantity} aves</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 text-[10px] text-muted font-semibold">
                        <Calendar size={12} />
                        {new Date(loss.date).toLocaleDateString()} {new Date(loss.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {loss.reason ? (
                      <p className="text-xs text-foreground/80 font-medium">
                        Motivo: <span className="text-foreground">{loss.reason}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-muted italic">Sem observação registrada</p>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedLossToUndo(loss)}
                    disabled={isUndoing}
                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition border border-rose-500/10 hover:border-rose-500 flex items-center gap-1 text-xs font-bold active:scale-95 disabled:opacity-50"
                    title="Desfazer este registro e devolver as aves ao saldo do lote"
                  >
                    <RotateCcw size={14} />
                    <span className="hidden sm:inline">Desfazer</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex justify-end relative z-10">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl transition text-sm border border-border"
          >
            Fechar Janela
          </button>
        </div>
      </div>

      {/* Premium Confirm Modal */}
      <DeleteConfirmModal
        isOpen={selectedLossToUndo !== null}
        onClose={() => setSelectedLossToUndo(null)}
        onConfirm={async () => {
          if (selectedLossToUndo) {
            await onUndo(selectedLossToUndo.id);
            setSelectedLossToUndo(null);
          }
        }}
        isLoading={isUndoing}
        title="Reverter Registro de Morte?"
        description="Esta ação irá cancelar o registro do óbito e restaurar a quantidade exata de aves vivas de volta ao estoque deste lote imediatamente."
        itemName={selectedLossToUndo ? `Registro de Baixa - Lote ${batch.name}` : undefined}
        itemValue={selectedLossToUndo ? `${selectedLossToUndo.quantity} aves` : undefined}
      />
    </div>
  );
}
