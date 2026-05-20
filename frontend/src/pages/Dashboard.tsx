import { useState, useEffect } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { MetricCard } from '../components/Dashboard/MetricCard';
import { Bird, Wallet, TrendingUp, Receipt, ShoppingCart, Package, X, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSales } from '../hooks/useSales';
import { useBatches } from '../hooks/useBatches';
import type { Sale, Batch } from '../@types';
import { useGlobalDate } from '../contexts/DateContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Dashboard() {
  const { data, isLoading: isLoadingSummary } = useDashboard();
  const { recentSales } = useSales();
  const { batches } = useBatches();
  const { user } = useAuth();
  const { queryMonth, queryYear } = useGlobalDate();
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (user?.id) {
      const hasSeen = localStorage.getItem(`@AviarioPro:hasSeenOnboarding:${user.id}`);
      if (!hasSeen) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleFinishOnboarding = () => {
    if (user?.id) {
      localStorage.setItem(`@AviarioPro:hasSeenOnboarding:${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

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
    <>
      <motion.div
        key={`${queryMonth}-${queryYear}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-4 sm:space-y-6"
    >
      <header 
        id="tour-header" 
        className={`flex flex-col md:flex-row md:items-end justify-between gap-2 p-2 rounded-2xl transition-all duration-300 ${
          showOnboarding && currentSlide === 1 ? 'relative z-[60] bg-secondary/60 ring-4 ring-primary ring-offset-4 ring-offset-background shadow-2xl scale-[1.01]' : ''
        }`}
      >
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
          description="Aves que ainda estão no aviário hoje."
        />
        <div 
          id="tour-lucro-card" 
          className={`rounded-[2rem] transition-all duration-300 ${
            showOnboarding && currentSlide === 2 ? 'relative z-[60] ring-4 ring-primary ring-offset-4 ring-offset-background shadow-2xl scale-[1.03]' : ''
          }`}
        >
          <MetricCard 
            title="Lucro Real" 
            value={new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data?.realProfit || 0)} 
            icon={<TrendingUp size={24} />} 
            color="green"
            description="O dinheiro que sobrou limpo após pagar as despesas."
          />
        </div>
        <MetricCard 
          title="Contas a Receber" 
          value={new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data?.totalToReceive || 0)} 
          icon={<Wallet size={24} />} 
          color="yellow"
          description="Dinheiro de vendas a fiado que os clientes ainda devem."
        />
        <MetricCard 
          title="Saldo de Caixa" 
          value={new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data?.cashBalance || 0)} 
          icon={<Receipt size={24} />} 
          color="red"
          description="Todo o dinheiro vivo que você tem na mão agora."
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
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 text-amber-600 mb-4">
              <Sparkles size={18} className="animate-pulse" /> Atenção: Compromissos para Hoje e Amanhã
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
        <div 
          id="tour-vendas-card" 
          className={`lg:col-span-2 bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 ${
            showOnboarding && currentSlide === 3 ? 'relative z-[60] ring-4 ring-primary ring-offset-4 ring-offset-background scale-[1.01]' : ''
          }`}
        >
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
        <div 
          id="tour-lotes-card" 
          className={`bg-card border border-border rounded-[2rem] p-6 shadow-2xl relative overflow-hidden transition-all duration-300 ${
            showOnboarding && currentSlide === 4 ? 'relative z-[60] ring-4 ring-primary ring-offset-4 ring-offset-background scale-[1.02]' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16"></div>
          <h3 className="font-bold flex items-center gap-2 mb-6 relative z-10 text-foreground">
            <Package size={18} className="text-primary" /> Stock de Lotes
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

    {/* ONBOARDING / GUIA DE BOAS-VINDAS */}
    <AnimatePresence>
      {showOnboarding && (
        <div className="fixed md:bottom-6 md:right-6 bottom-4 left-4 right-4 md:left-auto md:w-[420px] z-[80]">
          {/* Floating Card Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="relative w-full bg-card border-2 border-primary/30 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Top gradient border bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-emerald-400"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Sparkles size={18} className="animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-widest">Guia Rápido de Ações</span>
              </div>
              <button 
                onClick={handleFinishOnboarding}
                className="p-1 bg-secondary hover:bg-secondary/80 rounded-full text-muted hover:text-foreground transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Slides Content */}
            <div className="min-h-[140px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {currentSlide === 0 && (
                  <motion.div
                    key="slide0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-2"
                  >
                    <h2 className="text-lg font-black leading-tight text-foreground">
                      Bem-vindo ao <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Aviário Pro</span>! 🚀
                    </h2>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Preparamos este <strong>guia rápido</strong> para te mostrar as principais ações da tela inicial de forma interativa.
                    </p>
                    <p className="text-primary text-[10px] font-bold">
                      💡 Repare que cada elemento em foco ficará iluminado na tela ao avançar!
                    </p>
                  </motion.div>
                )}

                {currentSlide === 1 && (
                  <motion.div
                    key="slide1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 text-blue-500">
                      <Sparkles size={16} />
                      <h3 className="text-sm font-bold text-foreground">Filtro de Período</h3>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Altere o mês e o ano no topo para atualizar instantaneamente todos os dados, lotes e vendas exibidos na tela.
                    </p>
                  </motion.div>
                )}

                {currentSlide === 2 && (
                  <motion.div
                    key="slide2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 text-emerald-500">
                      <TrendingUp size={16} />
                      <h3 className="text-sm font-bold text-foreground">Acompanhar Lucro Líquido</h3>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Veja aqui o lucro final consolidado do mês, após descontar automaticamente todas as despesas e custos do período.
                    </p>
                  </motion.div>
                )}

                {currentSlide === 3 && (
                  <motion.div
                    key="slide3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 text-purple-500">
                      <ShoppingCart size={16} />
                      <h3 className="text-sm font-bold text-foreground">Vendas Recentes</h3>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Visualize suas últimas transações. Use o botão <strong>Vendas</strong> no menu lateral para registrar novos pedidos e receber pagamentos.
                    </p>
                  </motion.div>
                )}

                {currentSlide === 4 && (
                  <motion.div
                    key="slide4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 text-amber-500">
                      <Package size={16} />
                      <h3 className="text-sm font-bold text-foreground">Stock de Lotes</h3>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Monitore a quantidade de aves disponíveis. O stock é deduzido automaticamente a cada venda ou óbito registrado.
                    </p>
                  </motion.div>
                )}

                {currentSlide === 5 && (
                  <motion.div
                    key="slide5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-2"
                  >
                    <h3 className="text-base font-black text-foreground">Tudo Pronto para Começar! 🎉</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Você aprendeu a navegar pelas ações da tela inicial!
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Agora, clique em <strong>Lotes</strong> no menu lateral para abrir seu primeiro lote e iniciar as vendas!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-border/50">
                {/* Dots indicator */}
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? 'w-4 bg-primary' : 'w-1.5 bg-secondary'
                      }`}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-1.5">
                  {currentSlide > 0 && (
                    <button
                      onClick={() => setCurrentSlide(prev => prev - 1)}
                      className="px-3 py-1.5 bg-secondary rounded-xl text-[10px] font-bold hover:bg-secondary/80 transition-all text-foreground"
                    >
                      Voltar
                    </button>
                  )}

                  {currentSlide < 5 ? (
                    <button
                      onClick={() => setCurrentSlide(prev => prev + 1)}
                      className="px-3 py-1.5 bg-primary rounded-xl text-[10px] font-black text-black flex items-center gap-0.5 hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                    >
                      Avançar <ChevronRight size={12} />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishOnboarding}
                      className="px-4 py-1.5 bg-gradient-to-r from-primary to-emerald-500 rounded-xl text-[10px] font-black text-black flex items-center gap-0.5 hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                    >
                      Começar! ✨
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}