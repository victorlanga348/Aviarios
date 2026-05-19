import { useState, useEffect } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { MetricCard } from '../components/Dashboard/MetricCard';
import { Bird, Wallet, TrendingUp, Receipt, ShoppingCart, Package, X, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
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
          description="Aves que ainda estão no aviário hoje."
        />
        <MetricCard 
          title="Lucro Real" 
          value={new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data?.realProfit || 0)} 
          icon={<TrendingUp size={24} />} 
          color="green"
          description="O dinheiro que sobrou limpo após pagar as despesas."
        />
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

    {/* ONBOARDING / GUIA DE BOAS-VINDAS */}
    <AnimatePresence>
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={handleFinishOnboarding}
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 25 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            {/* Top gradient border bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={20} className="animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-widest">Guia Rápido</span>
              </div>
              <button 
                onClick={handleFinishOnboarding}
                className="p-1.5 bg-secondary hover:bg-secondary/80 rounded-full text-muted hover:text-foreground transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Slides Content */}
            <div className="min-h-[220px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {currentSlide === 0 && (
                  <motion.div
                    key="slide0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-black leading-tight text-foreground">
                      Bem-vindo ao <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Aviário Pro</span>! 🚀
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Estamos entusiasmados em ajudar você a gerir o seu negócio. Preparamos este guia rápido de 3 passos simples para você dominar as ferramentas mais essenciais do site imediatamente!
                    </p>
                  </motion.div>
                )}

                {currentSlide === 1 && (
                  <motion.div
                    key="slide1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                        <Package size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">1. Abra o seu Primeiro Lote</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Vá à aba <strong className="text-foreground">Lotes</strong> e adicione o seu primeiro lote de frangos. Insira a quantidade inicial, o custo que pagou por cada ave e o frete. 
                    </p>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-blue-400">
                      <strong>💡 Dica do Transporte:</strong> Se você não pagar frete ou não souber o custo de transporte, basta deixar em branco! O sistema definirá automaticamente como <strong>zero</strong>.
                    </div>
                  </motion.div>
                )}

                {currentSlide === 2 && (
                  <motion.div
                    key="slide2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                        <ShoppingCart size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">2. Registre uma Venda</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Sempre que um cliente comprar frangos, registre na aba <strong className="text-foreground">Vendas (PDV)</strong>. Digite o nome do cliente (se for novo, o sistema cadastra sozinho!) e o quanto ele pagou.
                    </p>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400">
                      <strong>🤝 Fiado Inteligente:</strong> Se o cliente não pagar tudo na hora, deixe o saldo pendente. A dívida vai aparecer automaticamente no perfil dele na aba <strong>Clientes & Fiados</strong>!
                    </div>
                  </motion.div>
                )}

                {currentSlide === 3 && (
                  <motion.div
                    key="slide3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                        <TrendingUp size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">3. Lance os Custos Mensais</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Na aba <strong className="text-foreground">Finanças</strong>, você pode registrar insumos (como sacos de Ração e Vacinas) e contas gerais (como água, luz e ração extra).
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      O sistema divide automaticamente os seus custos operacionais fixos pelos dias ativos do lote para mostrar o seu <strong>Lucro Real</strong> sem que você precise calcular nada!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/50">
                {/* Dots indicator */}
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? 'w-6 bg-primary' : 'w-2 bg-secondary'
                      }`}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  {currentSlide > 0 && (
                    <button
                      onClick={() => setCurrentSlide(prev => prev - 1)}
                      className="px-4 py-2 bg-secondary rounded-xl text-xs font-bold hover:bg-secondary/80 transition-all text-foreground"
                    >
                      Voltar
                    </button>
                  )}

                  {currentSlide < 3 ? (
                    <button
                      onClick={() => setCurrentSlide(prev => prev + 1)}
                      className="px-4 py-2 bg-primary rounded-xl text-xs font-black text-black flex items-center gap-1 hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                    >
                      Avançar <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishOnboarding}
                      className="px-5 py-2 bg-gradient-to-r from-primary to-emerald-500 rounded-xl text-xs font-black text-black flex items-center gap-1 hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                    >
                      Começar Agora! ✨
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