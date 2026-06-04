import { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Lightbulb,
  Bird,
  Wallet,
  Receipt,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const guideSections = [
  {
    id: 'dashboard',
    title: '0. Entendendo os 4 Cards do Dashboard',
    icon: <TrendingUp className="text-primary" size={24} />,
    color: 'bg-primary/10 border-primary/20',
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Ao abrir o sistema, a primeira coisa que vê são 4 indicadores financeiros no topo. Veja o que cada um representa de forma detalhada:</p>
        
        <div className="space-y-3">
          <div className="flex gap-3 items-start p-3 bg-secondary/20 rounded-2xl border border-border">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl mt-0.5"><Bird size={18} /></div>
            <div>
              <p className="font-bold text-foreground">Aves Vivas</p>
              <p className="text-xs mt-0.5">Mostra a quantidade exata de frangos que você tem vivos no aviário no momento. Esse número diminui automaticamente quando você realiza uma venda ou registra uma morte/perda.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 bg-secondary/20 rounded-2xl border border-border">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl mt-0.5"><TrendingUp size={18} /></div>
            <div>
              <p className="font-bold text-foreground">Lucro Real</p>
              <p className="text-xs mt-0.5">O dinheiro realmente líquido (limpo) gerado pelas suas operações no mês selecionado. O sistema pega no faturamento total e desconta tudo: o custo inicial dos frangos vendidos, o transporte desses frangos, os insumos consumidos (ração/vacinas) e as despesas operacionais fixas.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 bg-secondary/20 rounded-2xl border border-border">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl mt-0.5"><Wallet size={18} /></div>
            <div>
              <p className="font-bold text-foreground">Contas a Receber (Fiados)</p>
              <p className="text-xs mt-0.5">Representa as dívidas ativas de clientes. Sempre que faz uma venda a fiado (onde o valor pago é menor que o valor total), o valor restante é somado aqui. Esse dinheiro pertence a você, mas ainda não está no seu bolso.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 bg-secondary/20 rounded-2xl border border-border">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl mt-0.5"><Receipt size={18} /></div>
            <div>
              <p className="font-bold text-foreground">Saldo de Caixa</p>
              <p className="text-xs mt-0.5">Representa o montante de dinheiro vivo que você realmente tem em mãos agora. É a soma de todas as entradas de vendas (apenas o que já foi efetivamente pago) menos as saídas de insumos e contas mensais.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'lotes',
    title: '1. Como funcionam os Lotes?',
    icon: <Package className="text-blue-500" size={24} />,
    color: 'bg-blue-500/10 border-blue-500/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Um <strong>Lote</strong> é um grupo de frangos ou pintainhos que você comprou de uma só vez.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Custo Unitário:</strong> Quanto você pagou por CADA frango ao fornecedor.</li>
          <li><strong>Quantidade Inicial:</strong> Quantos frangos vieram nessa compra.</li>
          <li><strong>Custo de Transporte:</strong> (Opcional) O valor que você pagou para transportar os frangos até o aviário. Esse valor é muito importante porque ele é somado ao custo total do lote para calcular o seu lucro real.</li>
        </ul>
        <div className="p-3 bg-secondary/30 rounded-xl border border-border mt-2">
          <p className="font-bold text-foreground text-xs flex items-center gap-1"><Lightbulb size={14} className="text-amber-500"/> Dica de Ouro</p>
          <p className="text-xs mt-1">Sempre crie um lote assim que os frangos chegarem no aviário para manter o stock exato!</p>
        </div>
      </div>
    )
  },
  {
    id: 'vendas',
    title: '2. Registrando Vendas',
    icon: <ShoppingCart className="text-emerald-500" size={24} />,
    color: 'bg-emerald-500/10 border-emerald-500/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>As vendas retiram frangos do seu stock (Lotes ativos) e adicionam dinheiro ao seu Caixa.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Venda à Vista:</strong> Na hora da venda, coloque o "Valor Pago" igual ao "Valor Total". O status ficará como <em>PAGO</em>.</li>
          <li><strong>Venda a Fiado:</strong> Se o cliente pagou apenas uma parte (ou nada), coloque apenas o valor que ele pagou em dinheiro. O sistema guardará o restante como dívida (<em>PENDENTE</em>).</li>
          <li><strong>Cliente:</strong> Você pode pesquisar um cliente existente pelo nome ou simplesmente digitar um nome novo. O sistema cria o cliente automaticamente para você!</li>
        </ul>
      </div>
    )
  },
  {
    id: 'clientes',
    title: '3. Gestão de Clientes e Fiados',
    icon: <Users className="text-indigo-500" size={24} />,
    color: 'bg-indigo-500/10 border-indigo-500/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>A aba <strong>Clientes</strong> é onde você controla quem deve dinheiro ao aviário.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Dívida Total:</strong> Mostra o valor somado de todas as vendas que o cliente ainda não terminou de pagar.</li>
          <li><strong>Número de Celular:</strong> Se você não guardou o número do cliente na primeira venda, basta fazer uma nova venda para ele e colocar o celular. O sistema atualizará o contato automaticamente!</li>
          <li><strong>Histórico:</strong> Ao clicar num cliente, você pode ver exatamente quais vendas estão pendentes e registrar os pagamentos que ele for fazendo ao longo do tempo.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'mortes',
    title: '4. Perdas e Mortalidade',
    icon: <AlertTriangle className="text-rose-500" size={24} />,
    color: 'bg-rose-500/10 border-rose-500/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Infelizmente, mortes acontecem. Mas é crucial registrar cada perda no sistema.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Vá até a aba de Lotes e clique em "Registrar Morte".</li>
          <li>Isso vai subtrair o frango morto do seu stock atual.</li>
          <li>O sistema usa essa informação para calcular o seu <strong>Custo Real</strong>. Quando um frango morre, o dinheiro investido nele é "repassado" como prejuízo para os frangos vivos, diminuindo o seu lucro final. O Aviarios Pro faz essa matemática complexa por você!</li>
        </ul>
      </div>
    )
  },
  {
    id: 'lucro',
    title: '5. Entendendo o Lucro e Relatórios',
    icon: <TrendingUp className="text-amber-500" size={24} />,
    color: 'bg-amber-500/10 border-amber-500/20',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>A página de <strong>Relatórios</strong> é o coração financeiro do seu negócio.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Faturamento Bruto:</strong> É todo o dinheiro que entrou (ou vai entrar) das vendas.</li>
          <li><strong>Lucro Líquido Real:</strong> Esse é o número mais importante! É o seu faturamento descontando: O que você pagou nos frangos, o custo do transporte, a ração gasta e as mortes.</li>
          <li><strong>Despesas Fixas:</strong> Não se esqueça de registrar gastos com água, luz ou salários. O sistema vai "prorratear" (dividir) essas despesas pelos dias de vida dos frangos para mostrar se a sua operação realmente dá lucro no fim do mês.</li>
        </ul>
      </div>
    )
  }
];

export function Guide() {
  const [openSection, setOpenSection] = useState<string | null>('dashboard');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/10">
          <BookOpen size={32} />
        </div>
        <h1 className="text-3xl font-black italic tracking-tight text-foreground">
          MANUAL DE INSTRUÇÕES
        </h1>
        <p className="text-muted-foreground font-medium max-w-lg mx-auto">
          Tudo o que você precisa saber para dominar o Aviarios Pro e gerir o seu negócio como um verdadeiro profissional.
        </p>
      </div>

      <div className="space-y-4">
        {guideSections.map((section) => (
          <div 
            key={section.id} 
            className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-5 sm:p-6 bg-secondary/10 hover:bg-secondary/30 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${section.color}`}>
                  {section.icon}
                </div>
                <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
              </div>
              <ChevronDown 
                size={24} 
                className={`text-muted transition-transform duration-300 ${openSection === section.id ? 'rotate-180' : ''}`}
              />
            </button>
            
            <AnimatePresence>
              {openSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="p-5 sm:p-6 pt-0 sm:pt-0 border-t border-border/50">
                    <div className="pt-4">
                      {section.content}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-secondary/30 border border-border rounded-3xl p-8 text-center space-y-6">
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-black text-foreground">Ainda tem dúvidas ou precisa de Ajuda?</h3>
          <p className="text-sm text-muted-foreground">
            Se você encontrou alguma dificuldade ou precisa de suporte técnico especializado, entre em contato direto com o nosso suporte oficial via WhatsApp.
          </p>
        </div>

        <div className="flex justify-center">
          <a
            href="https://wa.me/258864336273"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-emerald-500/5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black">Suporte via WhatsApp</p>
              <p className="text-[10px] text-muted font-bold group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                Fale diretamente comigo no WhatsApp pessoal
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
