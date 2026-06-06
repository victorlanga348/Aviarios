import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { batchExpenseSchema, type BatchExpenseFormData } from '../../lib/validations/finance';
import type { Batch } from '../../@types';
import { X, Beef } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fastTransition, modalVariants, motionTransition, overlayVariants } from '../../lib/animations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  batches: Batch[];
  isLoading?: boolean;
  onSubmit: (data: BatchExpenseFormData) => Promise<void>;
}

export function BatchExpenseModal({ isOpen, onClose, batches, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BatchExpenseFormData>({
    resolver: zodResolver(batchExpenseSchema),
    defaultValues: {
      type: 'RACAO'
    }
  });

  const handleFormSubmit = async (data: BatchExpenseFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={motionTransition}
          className="w-full fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div 
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={fastTransition}
            className="bg-card border border-border p-5 md:p-8 rounded-2xl w-full max-w-md max-h-[calc(100dvh-2rem)] shadow-2xl my-4 sm:my-0 overflow-y-auto overflow-x-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                <Beef size={24} /> Insumos (Ração/Vacina)
              </h2>
              <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div>
                <label className="text-xs text-muted uppercase">Lote Destino</label>
                <select {...register('batchId')} className="w-full bg-background border border-border p-3 rounded-lg outline-none focus:border-primary/50">
                  <option value="">Selecione o Lote</option>
                  {batches.filter(b => b.status === 'ACTIVE').map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.batchId && <p className="text-red-500 text-xs mt-1">{errors.batchId.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted uppercase">Tipo de Insumo</label>
                  <select {...register('type')} className="w-full bg-background border border-border p-3 rounded-lg outline-none">
                    <option value="RACAO">Ração</option>
                    <option value="VACINA">Vacina / Remédio</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                </div>
                <div>
                  <label className="text-xs text-muted uppercase">Custo (MZN)</label>
                  <input type="number" step="0.01" placeholder="0.00" {...register('amount', { valueAsNumber: true })} className="w-full bg-background border border-border p-3 rounded-lg outline-none" />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted uppercase">Descrição / Observação (Opcional)</label>
                <input {...register('description')} className="w-full bg-background border border-border p-3 rounded-lg outline-none" placeholder="Ex: Saco de 50kg Inicial" />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition mt-4"
              >
                {isLoading ? 'Registrando...' : 'Registrar Insumo'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
