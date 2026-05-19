import { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const guideSections = [
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
          <p className="text-xs mt-1">Sempre crie um lote assim que os frangos chegarem no aviário para manter o estoque exato!</p>
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
        <p>As vendas retiram frangos do seu estoque (Lotes ativos) e adicionam dinheiro ao seu Caixa.</p>
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
          <li>Isso vai subtrair o frango morto do seu estoque atual.</li>
          <li>O sistema usa essa informação para calcular o seu <strong>Custo Real</strong>. Quando um frango morre, o dinheiro investido nele é "repassado" como prejuízo para os frangos vivos, diminuindo o seu lucro final. O Aviário Pro faz essa matemática complexa por você!</li>
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
  const [openSection, setOpenSection] = useState<string | null>('lotes');

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
          Tudo o que você precisa saber para dominar o Aviário Pro e gerir o seu negócio como um verdadeiro profissional.
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

      <div className="mt-12 bg-primary/10 border border-primary/20 rounded-3xl p-6 text-center">
        <h3 className="font-bold text-primary mb-2">Ainda tem dúvidas?</h3>
        <p className="text-sm text-muted-foreground">
          Explore o sistema! A melhor forma de aprender é usando. Você pode registrar e apagar vendas à vontade para testar as funcionalidades.
        </p>
      </div>
    </div>
  );
}
