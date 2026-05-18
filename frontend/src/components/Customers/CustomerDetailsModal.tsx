import { useState } from 'react';
import { useClientSales, useCustomers } from '../../hooks/useCustomers';
import { X, Receipt, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.18, ease: 'easeInOut' }
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 35 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ 
              scale: 0.96, 
              opacity: 0, 
              y: 20,
              transition: { duration: 0.15, ease: 'easeInOut' }
            }}
            transition={{ type: 'spring', damping: 26, stiffness: 280, mass: 0.8 }}
            className="bg-card border border-border p-5 md:p-8 rounded-2xl w-full max-w-3xl shadow-[var(--shadow)] my-auto"
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[60vh] p-2">
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
                            <form onSubmit={handleSubmit(onPay)} className="flex gap-2">
                              <input 
                                type="number" 
                                step="0.01" 
                                placeholder="Valor"
                                max={sale.balance}
                                {...register('amount', { valueAsNumber: true, min: 1, max: sale.balance })}
                                className="w-full bg-background border border-border px-3 py-2 rounded-lg text-base outline-none focus:border-primary transition-colors text-foreground" 
                                autoFocus
                              />
                              <button 
                                type="submit" 
                                disabled={isPaying}
                                className="bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-base font-bold transition-colors"
                              >
                                Salvar
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setPayingSaleId(null)}
                                className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg text-base transition-colors border border-border"
                              >
                                Cancelar
                              </button>
                            </form>
                          ) : (
                            <button 
                              onClick={() => setPayingSaleId(sale.id)}
                              className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-lg text-base font-medium transition-colors border border-border"
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
