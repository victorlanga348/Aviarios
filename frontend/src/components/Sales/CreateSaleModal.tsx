import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saleSchema, type SaleFormData } from '../../lib/validations/sale';
import type { Batch, Customer } from '../../@types';
import { X, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fastTransition, feedbackVariants, modalVariants, motionTransition, overlayVariants } from '../../lib/animations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  batches: Batch[];
  customers: Customer[];
  onSubmit: (data: SaleFormData) => Promise<void>;
}

export function CreateSaleModal({ isOpen, onClose, batches, customers, onSubmit }: Props) {
  // Recupera o último preço usado do LocalStorage para agilizar as vendas
  const lastUnitPrice = localStorage.getItem('@AviarioPro:lastUnitPrice');
  const defaultUnitPrice = lastUnitPrice ? parseFloat(lastUnitPrice) : undefined;

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      unitPrice: defaultUnitPrice,
      quantity: 0,
      amountPaid: 0
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        unitPrice: defaultUnitPrice,
        quantity: 0,
        amountPaid: 0,
        isScheduled: false,
        scheduledDeliveryDate: undefined,
        debtDueDate: undefined,
        customerId: '',
        customerName: '',
        customerPhone: ''
      });
    }
  }, [isOpen, reset, defaultUnitPrice]);

  const handleFormSubmit = async (data: SaleFormData) => {
    // Salva o preço de venda atual para a próxima vez
    localStorage.setItem('@AviarioPro:lastUnitPrice', data.unitPrice.toString());
    await onSubmit(data);
    reset();
  };

  // Cálculos em tempo real
  const qty = watch('quantity') || 0;
  const price = watch('unitPrice') || 0;
  const paid = watch('amountPaid') || 0;
  const total = qty * price;
  const balance = total - paid;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={motionTransition}
          className="w-full fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start lg:items-center justify-center p-4 z-50 overflow-x-hidden overflow-y-auto"
          onClick={onClose}
        >
          <motion.div 
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={fastTransition}
            className="bg-card border border-border p-5 md:p-8 rounded-2xl w-full max-w-2xl max-h-[calc(100dvh-2rem)] shadow-2xl my-4 lg:my-0 overflow-y-auto overflow-x-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calculator className="text-primary" /> Registrar Venda
              </h2>
              <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              <div className="space-y-4 min-w-0">
                <div className="min-w-0">
                  <label className="text-xs text-muted uppercase">Lote de Origem</label>
                  <select {...register('batchId')} className="w-full bg-background border border-border p-3 rounded-lg outline-none focus:border-primary">
                    <option value="">Selecione o Lote</option>
                    {batches.filter(b => b.status === 'ACTIVE').map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.actualQuantity} disponíveis)</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="text-xs text-muted uppercase">Cliente (Existente)</label>
                  <select {...register('customerId')} className="w-full bg-background border border-border p-3 rounded-lg outline-none focus:border-primary">
                    <option value="">Selecione o Cliente</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.customerId && <p className="text-red-500 text-[10px] mt-1">{errors.customerId.message}</p>}
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-muted uppercase">Ou Novo Cadastro</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div className="min-w-0">
                  <label className="text-xs text-muted uppercase">Nome do Novo Cliente</label>
                  <input {...register('customerName')} className="w-full bg-background border border-border p-3 rounded-lg outline-none focus:border-primary" placeholder="Digite o nome completo" />
                  {errors.customerName && <p className="text-red-500 text-[10px] mt-1">{errors.customerName.message}</p>}
                </div>

                <div className="min-w-0">
                  <label className="text-xs text-muted uppercase">Telefone do Novo Cliente</label>
                  <input {...register('customerPhone')} className="w-full bg-background border border-border p-3 rounded-lg outline-none focus:border-primary" placeholder="84... ou 85..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                  <div className="min-w-0">
                    <label className="text-xs text-muted uppercase">Quantidade</label>
                    <input type="number" placeholder="0" {...register('quantity', { valueAsNumber: true })} onFocus={(e) => e.target.select()} className="w-full bg-background border border-border p-3 rounded-lg" />
                  </div>
                  <div className="min-w-0">
                    <label className="text-xs text-muted uppercase">Preço Unit.</label>
                    <input type="number" step="0.01" placeholder="0.00" {...register('unitPrice', { valueAsNumber: true })} onFocus={(e) => e.target.select()} className="w-full bg-background border border-border p-3 rounded-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                  <div className="flex items-center gap-3 bg-background border border-border p-3 rounded-lg h-[46px] self-end min-w-0">
                    <input type="checkbox" {...register('isScheduled')} id="isScheduled" className="w-4 h-4 accent-primary rounded cursor-pointer" />
                    <label htmlFor="isScheduled" className="text-xs text-foreground uppercase font-bold cursor-pointer min-w-0">Agendar Entrega?</label>
                  </div>
                  {watch('isScheduled') ? (
                    <div className="min-w-0">
                      <label className="text-xs text-muted uppercase">Data da Entrega</label>
                      <div className="date-input-shell bg-background border border-border rounded-lg focus-within:border-primary transition-colors">
                        <input type="date" {...register('scheduledDeliveryDate')} className="h-11 px-3 outline-none text-sm text-foreground" required={watch('isScheduled')} />
                      </div>
                    </div>
                  ) : <div className="hidden sm:block"></div>}
                </div>
              </div>

              <div className="bg-background/50 p-5 sm:p-6 rounded-xl border border-border flex flex-col justify-between min-w-0 overflow-hidden">
                <div className="space-y-4">
                  <div className="flex flex-col min-[360px]:flex-row min-[360px]:justify-between gap-1">
                    <span className="text-muted">Total da Venda:</span>
                    <span className="text-xl font-bold break-words">MZN {total.toFixed(2)}</span>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted uppercase">Valor Pago Agora</label>
                    <input type="number" step="0.01" placeholder="0.00" {...register('amountPaid', { valueAsNumber: true })} onFocus={(e) => e.target.select()} className="w-full bg-primary/10 border border-primary/30 p-3 rounded-lg text-primary text-xl font-bold outline-none" />
                  </div>

                  <div className="flex flex-col min-[360px]:flex-row min-[360px]:justify-between gap-1 p-3 bg-red-500/10 rounded-lg">
                    <span className="text-red-500 text-sm">Dívida (Fiado):</span>
                    <span className="text-red-500 font-bold break-words">MZN {balance > 0 ? balance.toFixed(2) : '0.00'}</span>
                  </div>

                  <AnimatePresence>
                    {balance > 0 && (
                      <motion.div 
                        variants={feedbackVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={fastTransition}
                        className="pt-2"
                      >
                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 mb-1 block">Data Limite Pagamento (Cobrança)</label>
                        <div className="date-input-shell bg-background border border-red-500/30 rounded-lg focus-within:border-red-500/80 transition-colors">
                          <input type="date" {...register('debtDueDate')} className="h-11 px-3 outline-none text-sm text-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button type="submit" className="w-full bg-primary hover:bg-emerald-500 text-black font-black py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-6">
                  {watch('isScheduled') ? 'Registrar e Agendar Entrega' : 'Finalizar Venda'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
