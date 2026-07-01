import { useMemo } from 'react';
import { Bird, Package, Receipt, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { MetricCard } from '../components/Dashboard/MetricCard';
import type { Batch, Sale } from '../@types';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalDate } from '../contexts/DateContext';
import { useBatches } from '../hooks/useBatches';
import { useDashboard } from '../hooks/useDashboard';
import { useSales } from '../hooks/useSales';
import { motionTransition, pageVariants } from '../lib/animations';
import { formatCurrency, formatFullDate, formatShortDate } from '../lib/formatters';

export function Dashboard() {
  const { data, isLoading: isLoadingSummary } = useDashboard();
  const { recentSales } = useSales();
  const { batches } = useBatches();
  const { user } = useAuth();
  const { queryMonth, queryYear } = useGlobalDate();

  const formattedDate = useMemo(() => formatFullDate(new Date()), []);
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  const currencyValues = useMemo(
    () => ({
      realProfit: formatCurrency(data?.realProfit || 0),
      totalToReceive: formatCurrency(data?.totalToReceive || 0),
      cashBalance: formatCurrency(data?.cashBalance || 0),
    }),
    [data?.cashBalance, data?.realProfit, data?.totalToReceive],
  );

  const recentSalesPreview = useMemo(() => recentSales.slice(0, 5), [recentSales]);

  const activeBatches = useMemo(
    () => batches.filter((batch) => batch.status === 'ACTIVE').slice(0, 4),
    [batches],
  );

  const alerts = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = tomorrow.toISOString().split('T')[0];

    return recentSales.filter((sale: Sale) => {
      if (sale.balance > 0 && sale.debtDueDate) {
        const dueDateKey = new Date(sale.debtDueDate).toISOString().split('T')[0];
        if (dueDateKey === todayKey || dueDateKey === tomorrowKey) return true;
      }

      if (sale.isScheduled && sale.scheduledStatus === 'PENDING' && sale.scheduledDeliveryDate) {
        const deliveryDateKey = new Date(sale.scheduledDeliveryDate).toISOString().split('T')[0];
        if (deliveryDateKey === todayKey || deliveryDateKey === tomorrowKey) return true;
      }

      return false;
    });
  }, [recentSales, todayKey]);

  if (isLoadingSummary) {
    return (
      <div className="space-y-8 p-1 sm:p-0">
        <div className="h-24 rounded-3xl border border-border bg-secondary/50 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-2xl border border-border bg-card p-6 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">Erro ao carregar dados do dashboard.</div>;
  }

  return (
    <motion.div
      key={`${queryMonth}-${queryYear}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={motionTransition}
      className="space-y-4 sm:space-y-6"
    >
      <header className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Olá, {user?.name?.split(' ')[0] || 'utilizador'}
          </h1>
          <p className="text-xs font-medium text-muted sm:text-sm">{formattedDate}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        <MetricCard title="Aves Vivas" value={data.totalLiveBirds || 0} icon={<Bird size={24} />} color="blue" description="Em stock" />
        <MetricCard title="Lucro Real" value={currencyValues.realProfit} icon={<TrendingUp size={24} />} color="green" description="Receita menos custos" />
        <MetricCard title="Contas a Receber" value={currencyValues.totalToReceive} icon={<Wallet size={24} />} color="yellow" description="Saldo em aberto" />
        <MetricCard title="Saldo de Caixa" value={currencyValues.cashBalance} icon={<Receipt size={24} />} color="red" description="Entradas menos saídas" />
      </div>

      {alerts.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-amber-600">
            Compromissos para hoje e amanhã
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {alerts.map((sale: Sale) => {
              const isDebt = sale.balance > 0 && sale.debtDueDate;
              const dateStr = isDebt ? sale.debtDueDate : sale.scheduledDeliveryDate;
              const isToday = new Date(dateStr!).toISOString().split('T')[0] === todayKey;

              return (
                <div key={sale.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                  <div>
                    <p className="font-bold text-foreground">{sale.customerName}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                        isToday ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {isToday ? 'Hoje' : 'Amanhã'}
                      </span>
                      {isDebt ? 'Cobrar Dívida' : 'Entregar Venda Agendada'}
                    </p>
                  </div>
                  <div className="text-right">
                    {isDebt ? (
                      <span className="font-black text-rose-500">{formatCurrency(sale.balance)}</span>
                    ) : (
                      <span className="font-black text-emerald-500">{sale.quantity} aves</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border bg-secondary/30 p-6">
            <h3 className="flex items-center gap-2 font-bold text-foreground">
              <ShoppingCart size={18} className="text-primary" /> Vendas Recentes
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Últimas 5</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border bg-secondary/10 text-[10px] uppercase text-muted">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Lote</th>
                  <th className="p-4">Quantidade</th>
                  <th className="p-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentSalesPreview.map((sale: Sale) => (
                  <tr key={sale.id} className="group transition-colors hover:bg-secondary/20">
                    <td className="p-4">
                      <p className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">{sale.customerName}</p>
                      <p className="text-[10px] text-muted">{formatShortDate(sale.date)}</p>
                    </td>
                    <td className="p-4 text-xs font-medium text-muted">{sale.batchName}</td>
                    <td className="p-4 font-mono text-sm text-foreground">{sale.quantity}</td>
                    <td className="p-4 text-right">
                      <span className="block text-sm font-black text-primary">{formatCurrency(sale.totalValue)}</span>
                      {sale.balance > 0 && (
                        <span className="mt-1 inline-block rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-500">Dívida: {formatCurrency(sale.balance)}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {recentSalesPreview.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-sm italic text-muted">Nenhuma venda encontrada</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-6 flex items-center gap-2 font-bold text-foreground">
            <Package size={18} className="text-primary" /> Stock de Lotes
          </h3>
          <div className="space-y-6">
            {activeBatches.map((batch: Batch) => {
              const percentage = Math.round((batch.actualQuantity / batch.initialQuantity) * 100);

              return (
                <div key={batch.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-foreground">{batch.name}</span>
                    <span className="text-primary">{batch.actualQuantity} aves</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full border border-border bg-secondary">
                    <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-medium uppercase text-muted">
                    <span>Início: {batch.initialQuantity}</span>
                    <span>{percentage}% restante</span>
                  </div>
                </div>
              );
            })}

            {activeBatches.length === 0 && (
              <div className="py-10 text-center text-xs italic text-muted">Sem lotes ativos no momento</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
