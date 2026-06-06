import { useDashboard } from '../hooks/useDashboard';
import { MetricCard } from '../components/Dashboard/MetricCard';
import { Bird, Wallet, TrendingUp, Receipt, ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSales } from '../hooks/useSales';
import { useBatches } from '../hooks/useBatches';
import type { Sale, Batch } from '../@types';
import { useGlobalDate } from '../contexts/DateContext';
import { motion } from 'framer-motion';
import { motionTransition, pageVariants } from '../lib/animations';

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
            <div key={i} className="bg-card border border-border p-6 rounded-2xl h-40 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">Erro ao carregar dados do dashboard.</div>;
  }

  return (
    <>
      <motion.div
        key={`${queryMonth}-${queryYear}`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      transition={motionTransition}
      className="space-y-4 sm:space-y-6"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Olá, {user?.name?.split(' ')[0] || 'utilizador'}
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
          description="Em stock"
        />
        <MetricCard 
          title="Lucro Real" 
          value={new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data?.realProfit || 0)} 
          icon={<TrendingUp size={24} />} 
          color="green"
          description="Receita menos custos"
        />
        <MetricCard 
          title="Contas a Receber" 
          value={new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data?.totalToReceive || 0)} 
          icon={<Wallet size={24} />} 
          color="yellow"
          description="Saldo em aberto"
        />
        <MetricCard 
          title="Saldo de Caixa" 
          value={new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data?.cashBalance || 0)} 
          icon={<Receipt size={24} />} 
          color="red"
          description="Entradas menos saídas"
        />
      </div>

      {/* Alertas de Hoje e Amanhã */}
      {(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const alerts = recentSales.filter((sale: Sale) => {
          if (sale.balance > 0 && sale.debtDueDate) {
            const dueDate = new Date(sale.debtDueDate).toISOString().split('T')[0];
            if (dueDate === todayStr || dueDate === tomorrowStr) return true;
          }
          if (sale.isScheduled && sale.scheduledStatus === 'PENDING' && sale.scheduledDeliveryDate) {
            const deliveryDate = new Date(sale.scheduledDeliveryDate).toISOString().split('T')[0];
            if (deliveryDate === todayStr || deliveryDate === tomorrowStr) return true;
          }
          return false;
        });

        if (alerts.length === 0) return null;

        return (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
            <h3 className="font-bold flex items-center gap-2 text-amber-600 mb-4">
              Compromissos para hoje e amanhã
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((sale: Sale) => {
                const isDebt = sale.balance > 0 && sale.debtDueDate;
                const dateStr = isDebt ? sale.debtDueDate : sale.scheduledDeliveryDate;
                const isToday = new Date(dateStr!).toISOString().split('T')[0] === todayStr;

                return (
                  <div key={sale.id} className="bg-card border border-border p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground">{sale.customerName}</p>
                      <p className="text-xs text-muted flex items-center gap-1 mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          isToday ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {isToday ? 'Hoje' : 'Amanhã'}
                        </span>
                        {isDebt ? 'Cobrar Dívida' : 'Entregar Venda Agendada'}
                      </p>
                    </div>
                    <div className="text-right">
                      {isDebt ? (
                        <span className="font-black text-rose-500">MZN {sale.balance.toLocaleString()}</span>
                      ) : (
                        <span className="font-black text-emerald-500">{sale.quantity} aves</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendas Recentes */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
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
                  <th className="p-4">Quantidade</th>
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
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-6 text-foreground">
            <Package size={18} className="text-primary" /> Stock de Lotes
          </h3>
          <div className="space-y-6">
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
                      className="h-full bg-primary transition-all duration-500 ease-out"
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

    </>
  );
}
