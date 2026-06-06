import { useState } from 'react';
import { useClientSales, useCustomers } from '../../hooks/useCustomers';
import { X, Receipt, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { fastTransition, modalVariants, motionTransition, overlayVariants } from '../../lib/animations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId: string | null;
  clientName: string;
}

export function CustomerDetailsModal({ isOpen, onClose, clientId, clientName }: Props) {
  const { data: clientData, isLoading } = useClientSales(clientId);
  const { registerPayment, isPaying } = useCustomers();
  const [payingSaleId, setPayingSaleId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<{ amount: number }>();

  const onPay = async (data: { amount: number }) => {
    if (!payingSaleId) return;
    await registerPayment({
      saleId: payingSaleId,
      amount: data.amount,
      paymentType: 'DINHEIRO' 
    });
    setPayingSaleId(null);
    reset();
  };

  return (
    <AnimatePresence>
      {isOpen && clientId && (
        <motion.div 
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={motionTransition}
          className="w-full fixed inset-0 bg-black/70 flex items-start justify-center p-4 z-50 overflow-y-auto overflow-x-hidden"
          onClick={onClose}
        >
          <motion.div 
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={fastTransition}
            className="bg-card border border-border p-5 md:p-6 rounded-2xl w-full max-w-3xl max-h-[calc(100dvh-2rem)] my-4 overflow-y-auto overflow-x-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Receipt className="text-primary" /> Histórico de: {clientName}
              </h2>
              <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={24}/></button>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted animate-pulse">Carregando histórico...</div>
            ) : (
              <div className="space-y-4">
                {clientData?.sales?.length === 0 && (
                  <div className="text-center py-8 text-muted">Nenhuma venda registrada para este cliente.</div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientData?.sales?.map(sale => (
                    <div key={sale.id} className={`p-4 rounded-xl border ${sale.balance > 0 ? 'border-rose-500/20 bg-rose-500/5' : 'border-emerald-500/20 bg-emerald-500/5'} flex flex-col gap-3`}>
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                          <p className="text-xs text-muted">{sale.quantity} aves • MZN {sale.unitPrice}/cada</p>
                        </div>
                        {sale.balance > 0 ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                            <AlertCircle size={12}/> Pendente
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                            <CheckCircle2 size={12}/> Pago
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted">Total: <b className="text-foreground">MZN {sale.totalValue}</b></span>
                        {sale.balance > 0 && <span className="text-rose-500 font-bold">Dívida: MZN {sale.balance}</span>}
                      </div>

                      {sale.balance > 0 && (
                        <div className="mt-2 border-t border-border pt-3">
                          {payingSaleId === sale.id ? (
                            <form onSubmit={handleSubmit(onPay)} className="flex flex-col gap-3 mt-1">
                              <div>
                                <label className="text-xs text-muted font-medium block mb-1 ml-1">Valor do pagamento</label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">MZN</span>
                                  <input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0.00"
                                    max={sale.balance}
                                    {...register('amount', { valueAsNumber: true, min: 1, max: sale.balance })}
                                    className="w-full pl-14 pr-4 py-3 bg-background border border-border rounded-xl text-lg font-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground" 
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  type="submit" 
                                  disabled={isPaying}
                                  className="flex-1 bg-primary hover:bg-emerald-500 text-black py-3 rounded-xl text-sm font-black transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                                >
                                  Confirmar Recebimento
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => setPayingSaleId(null)}
                                  className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-3 rounded-xl text-sm font-bold transition-all border border-border active:scale-95"
                                  title="Cancelar"
                                >
                                  <X size={20} />
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button 
                              onClick={() => setPayingSaleId(sale.id)}
                              className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground py-3 rounded-xl text-sm font-bold transition-all border border-border active:scale-[0.98]"
                            >
                              <DollarSign size={16}/> Receber Pagamento
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
