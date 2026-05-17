import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { batchSchema, type BatchFormData } from '../../lib/validations/batch';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onSubmit: (data: BatchFormData) => Promise<void>;
}

export function CreateBatchModal({ isOpen, onClose, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema)
  });

  const handleFormSubmit = async (data: BatchFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

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
            className="bg-card border border-border p-5 md:p-8 rounded-2xl w-full max-w-md shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Novo Lote</h2>
              <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div>
                <label className="text-sm text-muted mb-1 block">Identificação do Lote</label>
                <input {...register('name')} className="w-full bg-background border border-border p-3 rounded-lg focus:border-primary outline-none" placeholder="Ex: Lote Verão 2024" />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted mb-1 block">Qtd. Aves</label>
                  <input type="number" placeholder="0" {...register('initialQuantity', { valueAsNumber: true })} className="w-full bg-background border border-border p-3 rounded-lg outline-none" />
                  {errors.initialQuantity && <span className="text-red-500 text-xs">{errors.initialQuantity.message}</span>}
                </div>
                <div>
                  <label className="text-sm text-muted mb-1 block">Custo p/ Ave (MZN)</label>
                  <input type="number" step="0.01" placeholder="0.00" {...register('costPerBird', { valueAsNumber: true })} className="w-full bg-background border border-border p-3 rounded-lg outline-none" />
                  {errors.costPerBird && <span className="text-red-500 text-xs">{errors.costPerBird.message}</span>}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted mb-1 block">Custo de Transporte / Frete (MZN)</label>
                <input type="number" step="0.01" placeholder="0.00" {...register('transportCost', { valueAsNumber: true })} className="w-full bg-background border border-border p-3 rounded-lg outline-none" />
                {errors.transportCost && <span className="text-red-500 text-xs">{errors.transportCost.message}</span>}
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
              >
                {isLoading ? 'Abrindo Lote...' : 'Confirmar Abertura de Lote'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}