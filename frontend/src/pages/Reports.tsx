import { useReports } from '../hooks/useReports';
import { FileText, Download, TrendingUp, HelpCircle } from 'lucide-react';
import { useGlobalDate } from '../contexts/DateContext';
import { motion } from 'framer-motion';

interface ReportEntry {
  id: string;
  description: string;
  type: string;
  amount: number;
}

export function Reports() {
  const { report, isLoading } = useReports();
  const { queryMonth, queryYear } = useGlobalDate();

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return (
    <div className="p-8 text-primary animate-pulse flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      Gerando relatório...
    </div>
  );

  if (!report) return (
    <div className="p-8 text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20">
      Não foi possível carregar o relatório. Verifique se existem dados registrados.
    </div>
  );

  return (
    <motion.div
      key={`${queryMonth}-${queryYear}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 print:space-y-4 print:p-0"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-foreground">
          <FileText className="text-primary shrink-0" /> <span className="truncate">Relatório de Performance</span>
        </h2>
        <button 
          onClick={handlePrint}
          className="w-full md:w-auto flex justify-center items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition shadow-[var(--shadow)] active:scale-95"
        >
          <Download size={20} /> Exportar PDF Profissional
        </button>
      </div>

      {/* CABEÇALHO PROFISSIONAL PARA PDF (Escondido na tela) */}
      <div className="hidden print:flex flex-col border-b-4 border-primary pb-6 mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tighter uppercase">Aviarios Pro</h1>
            <p className="text-sm font-bold text-gray-600">Sistema de Gestão Avícola de Alta Performance</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-gray-500">Documento Oficial</p>
            <p className="text-sm font-black text-foreground">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
          <h2 className="text-xl font-black uppercase text-primary">Relatório de Fechamento de Lote e Performance Financeira</h2>
        </div>
      </div>

      {/* RESUMO DE MÉTRICAS (Formatado para PDF) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        {/* Receita Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-[var(--shadow)] print:bg-gray-50 print:border-gray-200 print:shadow-none relative">
          <div className="flex items-center gap-1.5 mb-2 select-none group/tooltip">
            <p className="text-muted text-[10px] uppercase font-black tracking-widest print:text-gray-500">Receita Total</p>
            <div className="cursor-help text-muted/40 hover:text-primary transition-colors py-0.5 print:hidden">
              <HelpCircle size={14} />
              <div className="pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute top-full left-0 mt-2 w-48 sm:w-56 p-3.5 bg-foreground border border-border text-background text-xs font-semibold leading-relaxed rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-1">
                Todo o dinheiro que entrou com as vendas de aves.
              </div>
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-500 print:text-emerald-700">MZN {report?.totalIncomes.toLocaleString()}</p>
        </div>

        {/* Custo Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-[var(--shadow)] print:bg-gray-50 print:border-gray-200 print:shadow-none relative">
          <div className="flex items-center gap-1.5 mb-2 select-none group/tooltip">
            <p className="text-muted text-[10px] uppercase font-black tracking-widest print:text-gray-500">Custo Total</p>
            <div className="cursor-help text-muted/40 hover:text-primary transition-colors py-0.5 print:hidden">
              <HelpCircle size={14} />
              <div className="pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute top-full left-0 mt-2 w-48 sm:w-56 p-3.5 bg-foreground border border-border text-background text-xs font-semibold leading-relaxed rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-1">
                Tudo o que você gastou para criar as aves (ração, vacinas e contas).
              </div>
            </div>
          </div>
          <p className="text-2xl font-black text-rose-500 print:text-rose-700">MZN {report?.totalExpenses.toLocaleString()}</p>
        </div>

        {/* Lucro Card */}
        <div className="bg-card p-6 rounded-2xl border border-primary/20 shadow-[var(--shadow)] print:bg-primary/5 print:border-primary/30 relative">
          <div className="flex items-center gap-1.5 mb-2 select-none group/tooltip">
            <p className="text-muted text-[10px] uppercase font-black tracking-widest print:text-primary/70">Lucro Líquido</p>
            <div className="cursor-help text-muted/40 hover:text-primary transition-colors py-0.5 print:hidden">
              <HelpCircle size={14} />
              <div className="pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute top-full left-0 mt-2 w-48 sm:w-56 p-3.5 bg-foreground border border-border text-background text-xs font-semibold leading-relaxed rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-1">
                O dinheiro limpo que sobrou livre para você.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black text-foreground">MZN {report?.netMargin.toLocaleString()}</p>
            <TrendingUp size={24} className="text-primary" />
          </div>
        </div>
      </div>

      {/* TABELA DE DETALHAMENTO (Estilizada para PDF) */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow)] print:border-gray-200 print:rounded-none print:shadow-none">
        <div className="p-4 bg-secondary/30 font-black text-xs uppercase tracking-widest text-foreground border-b border-border print:bg-gray-100 print:text-black">
          Discriminação de Custos e Insumos
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-muted text-[10px] uppercase border-b border-border bg-secondary/10 print:text-gray-600 print:bg-gray-50 print:border-gray-200">
              <tr>
                <th className="p-4">Descrição do Item</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-gray-100">
              {report?.items.map((item: ReportEntry) => (
                <tr key={item.id} className="hover:bg-secondary/10 transition-colors print:hover:bg-transparent group">
                  <td className="p-4 text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.description}</td>
                  <td className="p-4">
                    <span className="text-[10px] bg-secondary/80 px-2.5 py-1 rounded-lg text-foreground font-black border border-border print:bg-gray-100 print:text-gray-600">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-rose-500 print:text-black">
                    MZN {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RODAPÉ E ASSINATURA (Apenas Impressão) */}
      <div className="hidden print:grid grid-cols-2 gap-20 mt-24">
        <div className="text-center border-t border-black pt-2">
          <p className="text-xs font-bold uppercase">Assinatura do Responsável</p>
        </div>
        <div className="text-center border-t border-black pt-2">
          <p className="text-xs font-bold uppercase">Data de Conferência</p>
        </div>
      </div>
      
      <div className="hidden print:block text-center mt-8 text-[8px] text-gray-400 uppercase tracking-[0.5em]">
        Gerado via Aviarios Pro - Gestão Inteligente
      </div>
    </motion.div>
  );
}
