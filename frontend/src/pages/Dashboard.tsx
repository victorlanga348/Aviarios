import { useDashboard } from '../hooks/useDashboard';
import { MetricCard } from '../components/Dashboard/MetricCard';
import { Bird, Wallet, TrendingUp, Receipt, ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSales } from '../hooks/useSales';
import { useBatches } from '../hooks/useBatches';
import type { Sale, Batch } from '../@types';
import { useGlobalDate } from '../contexts/DateContext';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { data, isLoading: isLoadingSummary } = useDashboard();
  const { recentSales } = useSales();
  const { batches } = useBatches();
  const { user } = useAuth();
  const { queryMonth, queryYear } = useGlobalDate();
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());

  if (isLoadingSummary) {
    return (
      <div className="space-y-8 p-1 sm:p-0">
        <div className="h-24 bg-secondary/50 rounded-3xl animate-pulse border border-border"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border p-6 rounded-[2rem] h-40 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">Erro ao carregar dados do dashboard.</div>;
  }

  return (
    <motion.div
      key={`${queryMonth}-${queryYear}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-4 sm:space-y-6"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <p className="text-primary font-bold tracking-widest uppercase text-[8px] sm:text-[10px] mb-0.5 sm:mb-1">Painel de Controle</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Olá, <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent dark:to-emerald-400">{user?.name?.split(' ')[0]}!</span>
          </h1>
          <p className="text-muted text-xs sm:text-sm font-medium">{formattedDate}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <MetricCard 
          title="Aves Vivas" 
          value={data?.totalLiveBirds || 0} 
          icon={<Bird size={24} />} 
          color="blue"
        />
        <MetricCard 
          title="Lucro Real" 
          value={new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data?.realProfit || 0)} 
          icon={<TrendingUp size={24} />} 
          color="green"
        />
        <MetricCard 
          title="Contas a Receber" 
          value={new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data?.totalToReceive || 0)} 
          icon={<Wallet size={24} />} 
          color="yellow"
        />
        <MetricCard 
          title="Saldo de Caixa" 
          value={new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data?.cashBalance || 0)} 
          icon={<Receipt size={24} />} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendas Recentes */}
        <div className="lg:col-span-2 bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
            <h3 className="font-bold flex items-center gap-2 text-foreground">
              <ShoppingCart size={18} className="text-primary" /> Vendas Recentes
            </h3>
            <span className="text-[10px] text-muted uppercase font-black tracking-widest">Últimas 5</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] text-muted uppercase border-b border-border bg-secondary/10">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Lote</th>
                  <th className="p-4">Qtd</th>
                  <th className="p-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentSales?.slice(0, 5).map((sale: Sale) => (
                  <tr key={sale.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="p-4">
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{sale.customerName}</p>
                      <p className="text-[10px] text-muted">{new Date(sale.date).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 text-xs text-muted font-medium">{sale.batchName}</td>
                    <td className="p-4 text-sm font-mono text-foreground">{sale.quantity}</td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-black text-primary block">MZN {sale.totalValue.toLocaleString()}</span>
                      {sale.balance > 0 && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase mt-1 inline-block">Dívida: {sale.balance.toLocaleString()}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!recentSales || recentSales.length === 0) && (
                  <tr><td colSpan={4} className="p-10 text-center text-muted text-sm italic">Nenhuma venda encontrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lotes Ativos */}
        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16"></div>
          <h3 className="font-bold flex items-center gap-2 mb-6 relative z-10 text-foreground">
            <Package size={18} className="text-primary" /> Estoque de Lotes
          </h3>
          <div className="space-y-6 relative z-10">
            {batches?.filter(b => b.status === 'ACTIVE').slice(0, 4).map((batch: Batch) => {
              const percentage = Math.round((batch.actualQuantity / batch.initialQuantity) * 100);
              return (
                <div key={batch.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-foreground">{batch.name}</span>
                    <span className="text-primary">{batch.actualQuantity} aves</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden border border-border">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted font-medium uppercase">
                    <span>Início: {batch.initialQuantity}</span>
                    <span>{percentage}% restante</span>
                  </div>
                </div>
              );
            })}
            {(!batches || batches.filter(b => b.status === 'ACTIVE').length === 0) && (
              <div className="text-center py-10 text-muted text-xs italic">Sem lotes ativos no momento</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}