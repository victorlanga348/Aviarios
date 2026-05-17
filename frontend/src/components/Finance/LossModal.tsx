import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lossSchema, type LossFormData } from '../../lib/validations/finance';
import type { Batch } from '../../@types';
import { X, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  batches: Batch[];
  isLoading?: boolean;
  onSubmit: (data: LossFormData) => Promise<void>;
}

export function LossModal({ isOpen, onClose, batches, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<LossFormData>({
    resolver: zodResolver(lossSchema)
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-card border border-red-500/20 p-5 md:p-8 rounded-2xl w-full max-w-md shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
                <Skull size={24} /> Registrar Baixa (Morte)
              </h2>
              <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs text-muted uppercase">Lote Afetado</label>
                <select {...register('batchId')} className="w-full bg-background border border-border p-3 rounded-lg outline-none focus:border-red-500/50">
                  <option value="">Selecione o Lote</option>
                  {batches.filter(b => b.status === 'ACTIVE').map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.batchId && <p className="text-red-500 text-xs mt-1">{errors.batchId.message}</p>}
              </div>

              <div>
                <label className="text-xs text-muted uppercase">Quantidade de Aves</label>
                <input type="number" placeholder="0" {...register('quantity', { valueAsNumber: true })} className="w-full bg-background border border-border p-3 rounded-lg outline-none" />
              </div>

              <div>
                <label className="text-xs text-muted uppercase">Causa/Observação</label>
                <textarea {...register('reason')} className="w-full bg-background border border-border p-3 rounded-lg outline-none h-24" placeholder="Ex: Calor excessivo, Doença, etc." />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
              >
                {isLoading ? 'Registrando...' : 'Confirmar Registro de Perda'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}