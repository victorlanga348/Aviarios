import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bird, 
  TrendingUp, 
  Wallet, 
  Receipt, 
  ShoppingCart, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight, 
  Truck, 
  AlertTriangle, 
  Users, 
  Coins, 
  Package,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Landing() {
  const navigate = useNavigate();
  
  // Controle local do Tema sincronizado com o localStorage do sistema
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('@AviarioPro:theme') as 'dark' | 'light') || 'dark'
  );

  // CORREÇÃO: No nosso CSS (index.css), o tema escuro é o padrão (:root) e o tema claro é ativado pela classe ".light"
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
    localStorage.setItem('@AviarioPro:theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col justify-between selection:bg-primary selection:text-white pt-[76px]">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse delay-1000 pointer-events-none"></div>

      {/* HEADER / NAVIGATION (FIXED STICKY WITH GLASSMORPHISM & THEME TOGGLE) */}
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b border-border/40 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Bird size={24} className="text-black" />
            </div>
            <span className="text-lg sm:text-xl font-black italic tracking-tighter text-primary">AVIÁRIO PRO</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Seletor de Tema Claro / Escuro com clique responsivo e sem hover residual no celular */}
            <button 
              onClick={toggleTheme} 
              className="p-2 text-muted sm:hover:text-foreground transition-colors mr-1 sm:mr-2 active:scale-95"
              aria-label="Mudar tema"
            >
              {theme === 'dark' ? <Sun size={20} className="text-primary" /> : <Moon size={20} />}
            </button>
            
            <button 
              onClick={() => navigate('/login')}
              className="text-xs sm:text-sm font-bold text-muted sm:hover:text-foreground transition-colors px-2.5 py-2 active:scale-95"
            >
              Já tenho conta
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-primary text-black font-black text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:hover:bg-emerald-500 transition shadow-lg shadow-primary/10 sm:hover:shadow-primary/20 active:scale-95 active:bg-emerald-600"
            >
              Começar Grátis
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 relative z-10 flex flex-col justify-center gap-12 sm:gap-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* TEXT CONTENT */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-primary font-bold text-xs uppercase tracking-wider">
              <ShieldCheck size={14} /> 100% Simples e Direto
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight text-foreground">
              O seu aviário na <br />
              <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent dark:to-emerald-400">
                palma da sua mão!
              </span>
            </h1>

            <p className="text-muted text-base sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Chega de papelada! Esqueça o caderno e controle seus lotes de aves, registre mortes de forma fácil, marque suas vendas a fiado e veja o seu lucro real de um jeito que você realmente entende.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto bg-primary sm:hover:bg-emerald-500 text-black font-black py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl shadow-primary/20 sm:hover:scale-[1.02] active:scale-95 active:bg-emerald-600"
              >
                Criar Minha Conta Grátis
                <ArrowRight size={20} className="group-hover:translate-x-1 sm:group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-secondary border border-border text-foreground sm:hover:bg-secondary/80 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
              >
                Entrar no Sistema
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* BEAUTIFUL MOCKUP CARD PREVIEW */}
          <div className="lg:col-span-5 relative w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-75 -z-10"></div>
            
            {/* Main Mockup Card */}
            <div className="bg-card border border-border p-5 sm:p-6 rounded-[2.5rem] shadow-2xl relative z-10 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Exemplo do Painel</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                </div>
              </div>

              {/* Sample Card Aves Vivas */}
              <div className="bg-secondary/40 border border-border/50 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
                  <Bird size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Aves Vivas Atuais</p>
                  <p className="text-xl font-black text-foreground">950 aves</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Aves que ainda estão no aviário hoje.</p>
                </div>
              </div>

              {/* Sample Card Lucro */}
              <div className="bg-secondary/40 border border-border/50 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Lucro Real</p>
                  <p className="text-xl font-black text-foreground">MZN 45.200</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">O dinheiro que sobrou limpo no seu bolso.</p>
                </div>
              </div>

              {/* Progress bar info */}
              <div className="bg-secondary/40 border border-border/50 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Lote 01 - Pintainhos</span>
                  <span className="text-primary">95% vivo</span>
                </div>
                <div className="h-2.5 bg-background rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES SECTION (SIMPLE LANGUAGE - EXPANDED TO 6 RICH SAAS FEATURE CARDS) */}
        <div className="space-y-12 border-t border-border/40 pt-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-black tracking-tight px-4">O que o Aviário Pro faz por você?</h2>
            <p className="text-muted font-medium px-4">Tudo o que você precisa para controlar seu negócio de aves de forma completa, sem complicações.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1: Lotes */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-[2rem] sm:hover:border-primary/20 transition-all duration-300 group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-6 sm:group-hover:scale-110 transition-transform">
                  <Package size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Controle Geral de Lotes</h3>
                <p className="text-muted text-sm leading-relaxed font-semibold">
                  Cadastre seus lotes e saiba na hora quantas aves você comprou originalmente e quantas aves vivas ainda estão no seu galpão hoje, prontas para venda.
                </p>
              </div>
            </div>

            {/* Feature 2: Transporte */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-[2rem] sm:hover:border-primary/20 transition-all duration-300 group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6 sm:group-hover:scale-110 transition-transform">
                  <Truck size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Custos de Frete Integrados</h3>
                <p className="text-muted text-sm leading-relaxed font-semibold">
                  Registre o valor do frete e transporte diretamente em cada lote. O sistema soma tudo automaticamente para calcular o verdadeiro custo inicial de cada ave.
                </p>
              </div>
            </div>

            {/* Feature 3: Mortes e Alertas */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-[2rem] sm:hover:border-primary/20 transition-all duration-300 group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-6 sm:group-hover:scale-110 transition-transform">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Alertas de Mortalidade</h3>
                <p className="text-muted text-sm leading-relaxed font-semibold">
                  Cadastre qualquer perda em dois cliques. O sistema acompanha a taxa de mortalidade e te avisa de forma imediata caso as mortes estejam acima do limite recomendado.
                </p>
              </div>
            </div>

            {/* Feature 4: Fiado e Clientes */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-[2rem] sm:hover:border-primary/20 transition-all duration-300 group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mb-6 sm:group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Controle Total do Fiado</h3>
                <p className="text-muted text-sm leading-relaxed font-semibold">
                  Esqueça o caderno! Gerencie clientes de forma fácil, registre vendas a fiado e veja na hora o saldo devedor e o histórico detalhado de pagamentos.
                </p>
              </div>
            </div>

            {/* Feature 5: Despesas Fixas */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-[2rem] sm:hover:border-primary/20 transition-all duration-300 group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Coins size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Despesas Fixas Prorrateadas</h3>
                <p className="text-muted text-sm leading-relaxed font-semibold">
                  Adicione custos mensais como luz, água e salários. O sistema divide essas despesas pelos dias de vida dos lotes ativos de forma justa e automática.
                </p>
              </div>
            </div>

            {/* Feature 6: Lucro Líquido Real */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-[2rem] sm:hover:border-primary/20 transition-all duration-300 group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Relatórios de Lucro Real</h3>
                <p className="text-muted text-sm leading-relaxed font-semibold">
                  Tenha seu balanço em tempo real. Veja as receitas de vendas e o dinheiro vivo em caixa, descontando todas as rações e custos fixos em um clique.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS (SIMPLE 4 STEPS) */}
        <div className="bg-secondary/20 border border-border p-6 sm:p-12 rounded-[2.5rem] space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black tracking-tight px-4">Como funciona? É muito simples!</h2>
            <p className="text-muted font-medium px-4">Veja os 4 passos para organizar todo o seu aviário de vez.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-3 relative bg-card/40 border border-border/40 p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary text-black font-black flex items-center justify-center text-sm">1</div>
              <h4 className="font-bold text-base text-foreground">Crie sua Conta</h4>
              <p className="text-muted text-xs leading-relaxed font-medium">Cadastre-se usando seu email e escolha uma senha segura em menos de um minuto.</p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 relative bg-card/40 border border-border/40 p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary text-black font-black flex items-center justify-center text-sm">2</div>
              <h4 className="font-bold text-base text-foreground">Adicione um Lote</h4>
              <p className="text-muted text-xs leading-relaxed font-medium">Diga a data que comprou as aves, a quantidade de pintainhos e o preço pago por elas.</p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 relative bg-card/40 border border-border/40 p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary text-black font-black flex items-center justify-center text-sm">3</div>
              <h4 className="font-bold text-base text-foreground">Registre o Dia a Dia</h4>
              <p className="text-muted text-xs leading-relaxed font-medium">Conforme o tempo passa, registre as vendas efetuadas, mortes de aves e gastos diários.</p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 relative bg-card/40 border border-border/40 p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black font-black flex items-center justify-center text-sm">✓</div>
              <h4 className="font-bold text-base text-foreground">Veja a Lucratividade</h4>
              <p className="text-muted text-xs leading-relaxed font-medium">Pronto! O sistema faz todas as contas difíceis e te entrega o lucro limpo na tela ou em PDF.</p>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA SECTION */}
        <div className="text-center py-12 space-y-6 sm:space-y-8 max-w-4xl mx-auto relative overflow-hidden rounded-[3rem] border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-6 sm:p-8">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-50"></div>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground relative z-10 leading-tight">
            Pronto para ver o seu negócio <br />
            decolar de verdade?
          </h2>
          <p className="text-muted font-medium text-sm sm:text-base max-w-xl mx-auto relative z-10 leading-relaxed">
            Junte-se a produtores que abandonaram a caneta e o caderno e agora gerenciam seus aviários de forma profissional e simples!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 pt-4 max-w-sm mx-auto">
            <button 
              onClick={() => navigate('/register')}
              className="w-full bg-primary sm:hover:bg-emerald-500 text-black font-black py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl shadow-primary/20 sm:hover:scale-[1.02] active:scale-95 active:bg-emerald-600"
            >
              Criar Conta Grátis
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-secondary border border-border text-foreground sm:hover:bg-secondary/80 font-bold py-4 px-8 rounded-2xl transition-all duration-300 active:scale-95"
            >
              Já tenho conta
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-border/40 py-8 bg-secondary/10 relative z-20 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted/60">
          <span>© {new Date().getFullYear()} AVIÁRIO PRO - GESTÃO AVÍCOLA DE ALTA PERFORMANCE</span>
          <span className="sm:hover:text-primary transition-colors cursor-pointer active:scale-95" onClick={() => navigate('/login')}>Desenvolvido com simplicidade</span>
        </div>
      </footer>
    </div>
  );
}
