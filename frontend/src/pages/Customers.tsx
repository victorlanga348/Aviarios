import { useState } from 'react';
import { useCustomers, type CustomerWithDebt } from '../hooks/useCustomers';
import { CustomerDetailsModal } from '../components/Customers/CustomerDetailsModal';
import { DeleteConfirmModal } from '../components/Finance/DeleteConfirmModal';
import { Users, Phone, AlertCircle, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cardListVariants, motionTransition } from '../lib/animations';

export function Customers() {
  const { customers, isLoading, deleteCustomer, isDeleting } = useCustomers();
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerWithDebt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  const totalDebt = customers.reduce((acc, c) => acc + c.totalDebt, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 md:p-8 rounded-[2rem] border border-border shadow-[var(--shadow)] relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <p className="text-primary font-black uppercase text-[10px] tracking-widest mb-1">Visão Geral</p>
          <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 text-foreground">
            <Users className="text-primary" size={28} /> <span className="truncate">Carteira de Clientes</span>
          </h2>
        </div>
        <div className="flex gap-6 sm:gap-8 relative z-10 w-full md:w-auto justify-start md:justify-end border-t border-border/50 md:border-0 pt-4 md:pt-0">
          <div className="text-right">
            <p className="text-muted text-[10px] uppercase font-black mb-1">Total a Receber</p>
            <p className="text-2xl font-black text-rose-500">MZN {totalDebt.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-muted text-[10px] uppercase font-black mb-1">Clientes Ativos</p>
            <p className="text-2xl font-black text-foreground">{customers.length}</p>
          </div>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou telefone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card border border-border p-4 pl-12 rounded-2xl outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted shadow-[var(--shadow)]"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20 animate-pulse text-muted flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          Carregando carteira de clientes...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCustomers.map((customer: CustomerWithDebt) => (
              <motion.div 
                key={customer.id} 
                layout
                variants={cardListVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={motionTransition}
                onClick={() => setSelectedClient({ id: customer.id, name: customer.name })}
                className="bg-card border border-border hover:border-primary/50 transition cursor-pointer p-5 rounded-2xl flex flex-col gap-4 shadow-[var(--shadow)] group relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{customer.name}</h3>
                    <p className="text-xs text-muted flex items-center gap-1 mt-1 font-medium">
                      <Phone size={12} className="text-primary/60" /> {customer.phone || 'Sem contato'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {customer.totalDebt > 0 ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                        <AlertCircle size={12} /> Em Dívida
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Tudo Certo
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (customer.totalDebt > 0) {
                          toast.error('Não é possível excluir um cliente com saldo devedor ativo!');
                        } else {
                          setCustomerToDelete(customer);
                        }
                      }}
                      className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      title={customer.totalDebt > 0 ? "Exclusão bloqueada (possui dívidas)" : "Excluir Cliente"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 flex justify-between items-center transition-colors group-hover:bg-secondary/60">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Saldo Devedor</span>
                  <span className={`font-black text-sm ${customer.totalDebt > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    MZN {customer.totalDebt.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {customers.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted border-2 border-dashed border-border rounded-[2rem] bg-secondary/10">
              Nenhum cliente cadastrado ainda.
            </div>
          )}
        </div>
      )}

      <CustomerDetailsModal
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        clientId={selectedClient?.id || null}
        clientName={selectedClient?.name || ''}
      />

      <DeleteConfirmModal
        isOpen={customerToDelete !== null}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={async () => {
          if (customerToDelete) {
            await deleteCustomer(customerToDelete.id);
            setCustomerToDelete(null);
          }
        }}
        isLoading={isDeleting}
        title="Excluir Cliente?"
        description="Você está prestes a excluir este cliente e todo o histórico de compras associado de forma permanente."
        itemName={customerToDelete?.name}
      />
    </div>
  );
}
