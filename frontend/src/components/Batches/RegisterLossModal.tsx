import { useState } from 'react';
import { Skull, AlertTriangle, X } from 'lucide-react';
import type { Batch } from '../../@types';

interface RegisterLossModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { batchId: string; quantity: number; reason?: string }) => Promise<void>;
  isLoading: boolean;
  batch: Batch | null;
}

export function RegisterLossModal({ isOpen, onClose, onSubmit, isLoading, batch }: RegisterLossModalProps) {
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !batch) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    if (qtyNum > batch.actualQuantity) {
      setError(`Quantidade de mortes (${qtyNum}) não pode ser maior que o saldo atual do lote (${batch.actualQuantity}).`);
      return;
    }

    try {
      await onSubmit({
        batchId: batch.id,
        quantity: qtyNum,
        reason: reason.trim() || undefined,
      });
      setQuantity('');
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocorreu um erro ao registrar a perda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className="relative bg-card border border-border rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl -mr-16 -mt-16"></div>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20">
              <Skull size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Registrar Morte / Perda</h3>
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

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="p-3 bg-rose-500/10 text-rose-500 text-xs font-semibold rounded-xl border border-rose-500/20 flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Alert */}
          <div className="p-4 bg-amber-500/10 text-amber-500 text-xs rounded-2xl border border-amber-500/20 flex gap-3 leading-relaxed">
            <AlertTriangle size={20} className="shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="font-bold">Atenção ao estoque físico!</p>
              <p className="text-amber-500/90 mt-1">
                Registrar mortes deduzirá **imediatamente** o saldo de aves vivas do lote. Esta operação é permanente e serve para manter o controle sanitário e de mortalidade preciso.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Quantidade */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted">Qtd de Aves Mortas</label>
              <div className="w-full min-w-0 overflow-hidden bg-secondary/50 border border-border rounded-xl focus-within:border-rose-500/50">
                <input 
                  type="number"
                  required
                  placeholder="Ex: 5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-transparent h-12 px-4 outline-none text-sm text-foreground block min-w-0 font-bold"
                  min="1"
                  max={batch.actualQuantity}
                />
              </div>
              <p className="text-[10px] text-muted right-4">Saldo máximo disponível: <span className="text-foreground font-bold">{batch.actualQuantity} aves</span></p>
            </div>

            {/* Motivo */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted">Causa / Observação</label>
              <div className="w-full min-w-0 overflow-hidden bg-secondary/50 border border-border rounded-xl focus-within:border-rose-500/50">
                <input 
                  type="text"
                  placeholder="Ex: Excesso de calor, doença, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-transparent h-12 px-4 outline-none text-sm text-foreground block min-w-0"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl transition text-sm border border-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-grow py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl transition text-sm shadow-lg shadow-rose-500/10 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Registrando...' : 'Confirmar Perda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
