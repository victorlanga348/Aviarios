import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fixedExpenseSchema, type FixedExpenseFormData } from '../../lib/validations/finance';
import { X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fastTransition, modalVariants, motionTransition, overlayVariants } from '../../lib/animations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onSubmit: (data: FixedExpenseFormData) => Promise<void>;
}

export function FixedExpenseModal({ isOpen, onClose, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FixedExpenseFormData>({
    resolver: zodResolver(fixedExpenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0]
    }
  });

  const handleFormSubmit = async (data: FixedExpenseFormData) => {
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
          className="w-full fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 z-50 overflow-x-hidden overflow-y-auto"
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
              <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-500">
                <Zap size={24} /> Despesa Operacional
              </h2>
              <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div>
                <label className="text-xs text-muted uppercase">Descrição / Nome da Conta</label>
                <input 
                  {...register('description')} 
                  className="w-full bg-background border border-border p-2.5 sm:p-3 rounded-lg outline-none text-sm text-foreground focus:border-yellow-500/50 block min-w-0" 
                  placeholder="Ex: Conta de Luz, Lenha..." 
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="text-xs text-muted uppercase">Valor (MZN)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...register('amount', { valueAsNumber: true })} 
                  className="w-full bg-background border border-border p-2.5 sm:p-3 rounded-lg outline-none text-sm text-foreground block min-w-0" 
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
              </div>
              
              <div>
                <label className="text-xs text-muted uppercase">Data</label>
                <div className="date-input-shell bg-background border border-border rounded-lg focus-within:border-yellow-500/50 transition-colors">
                  <input 
                    type="date" 
                    {...register('date')} 
                    className="h-11 px-3 outline-none text-sm text-foreground" 
                    style={{ colorScheme: 'dark' }} 
                  />
                </div>
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition mt-4"
              >
                {isLoading ? 'Registrando...' : 'Registrar Despesa'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
