> Este repositório é público apenas para demonstração. O uso, cópia ou reutilização do código não é permitido sem autorização.

# 🚀 Aviarios Pro - Gestão Inteligente de Aviários

Aplicação Full Stack para gerenciamento e controle financeiro de aviários, englobando gestão de lotes, vendas em ponto de venda (PDV), controle de clientes e fiados, lançamentos de despesas operacionais (fixas), compras de insumos (ração e vacinas), registro de baixas (mortes de aves) e geração de relatórios de lucratividade. 

Desenvolvido com foco em alta performance, Type Safety (TypeScript de ponta a ponta), segurança de dados e uma experiência de usuário (UX) premium com animações modernas e design responsivo à prova de quebras em dispositivos móveis.

---

## 🧠 Decisões de Arquitetura

### **1. Otimização de Consultas de Clientes (Solução para o Gargalo N+1)**
Para evitar o clássico problema de N+1 requisições (onde o frontend precisaria buscar os clientes e depois fazer uma requisição individual para calcular o saldo devedor de cada um), implementamos a agregação de débitos diretamente no banco de dados. Utilizando joins do **Prisma ORM** no PostgreSQL (`include: { sales: { ... } }`), o backend consolida os dados em uma única transação otimizada, reduzindo o tempo de carregamento no frontend de segundos para milissegundos.

### **2. Gerenciamento de Estado de Caching com TanStack Query**
A integração do **React Query** foi configurada globalmente para maximizar a performance:
- Desabilitação de re-consultas ao alternar de aba (`refetchOnWindowFocus: false`) para reduzir tráfego de rede inútil.
- Tempo de obsolescência (`staleTime: 5 min`) para preservar dados em memória e evitar requisições redundantes a cada clique de navegação.

### **3. Isolamento e Filtro por Mês Global (DateContext)**
A sincronização financeira é coordenada por um contexto global de data (`DateProvider`). Ao alterar o mês e o ano na barra de controle principal, o estado do TanStack Query é invalidado de forma automática, acionando o refetch dinâmico dos relatórios e do resumo financeiro apenas para o período selecionado.

### **4. Arquitetura em Três Camadas no Backend**
O servidor segue a divisão estrita de responsabilidades:
- **Routes**: Roteamento e proteção por middlewares.
- **Controllers**: Controle de fluxo HTTP, validação com Zod e formatação de respostas.
- **Services**: Lógica de negócio pura, isolamento do banco e transações Prisma (`$transaction`) para integridade das operações.

---

## 🔒 Pontos Técnicos e Segurança

- **Isolamento de Dados (Data Ownership):** Toda e qualquer ação de leitura ou escrita valida obrigatoriamente a propriedade do registro (`userId`) extraído do token JWT. Um usuário nunca consegue acessar ou modificar lotes, vendas ou despesas de outros usuários.
- **UUIDs v4:** Identificadores únicos universais utilizados em todas as tabelas (Lotes, Clientes, Vendas, Despesas), impossibilitando a previsão sequencial de registros por agentes maliciosos.
- **Transações ACID Garantidas:** Processos sensíveis, como o registro de mortes de aves (baixas) e vendas com dedução de estoque, utilizam transações no banco para garantir que a quantidade de aves do lote seja atualizada de forma atômica. Se um passo falhar, toda a operação sofre rollback.
- **Cascade Delete:** Relacionamentos estruturados de forma relacional estrita. Caso um lote ou cliente seja removido, dependências em cascata são tratadas com segurança para evitar órfãos.

---

## 🛠️ Tecnologias Utilizadas

### **Backend (Node.js & Express)**
- **Express & TypeScript:** Construção da API RESTful robusta e tipada.
- **Prisma ORM:** Abstração e modelagem com segurança estática de dados.
- **PostgreSQL:** Banco de dados relacional robusto com Neon.tech.
- **JWT (Json Web Token):** Autenticação stateless segura.
- **Bcrypt:** Criptografia unidirecional para senhas.
- **Zod:** Validação e sanitização estrita de inputs da API.

### **Frontend (React, TypeScript & Vite)**
- **React 18:** Componentização reativa modular.
- **TanStack Query (React Query v5):** Gerenciamento assíncrono de estado e caching.
- **Tailwind CSS 3:** Design moderno, utilitário e responsivo.
- **Framer Motion:** Animações e micro-interações fluidas e de alto nível.
- **React Hot Toast:** Sistema de alertas imediatos, ajustado para tempos rápidos (1.5s - 2.5s) para melhor agilidade na UX.
- **Axios:** Cliente HTTP com interceptadores inteligentes para injeção de tokens.

---

## 🔒 Destaques de Engenharia e UX

### **1. Animação de Caixa Registradora Dinâmica ("Subida e Descida") 📈📉**
Em vez de simplesmente alterar os números estáticos na tela, os cartões de métrica financeira do Dashboard (`MetricCard.tsx`) analisam a variação dos valores de forma em tempo real:
- **Subida (Aumento de Lucro/Valor)**: O número antigo desliza para cima e some enquanto o novo número entra subindo pelo rodapé do contêiner.
- **Descida (Queda/Saídas)**: O número antigo desliza para baixo e some enquanto o novo número entra descendo pelo topo.
Isso cria um efeito visual premium, similar a aplicativos modernos de fintech.

### **2. Correção de Overflow de Data no Mobile (Design Blindado)**
Os inputs nativos de data do celular costumam ignorar regras de espaçamento e estourar os limites da tela devido a controles nativos internos. Desenvolvemos uma estrutura blindada: o elemento `<input type="date">` fica transparente e encapsulado em uma `div` contêiner com `overflow-hidden`, `min-w-0` e dimensões seguras (`h-11 px-3`). Isso impede qualquer quebra de layout no celular ou tablet.

### **3. Transições Fluidas de Período**
Ao mudar os meses através do filtro do cabeçalho global, o Dashboard e a página de Relatórios sofrem um remonte limpo via `key` dinâmico do React, ativando uma transição suave de opacidade e subida em toda a página, proporcionando um feedback contínuo ao usuário.

---

## 📋 Principais Funcionalidades

- [x] **Controle de Lotes**: Cadastro, acompanhamento de aves ativas e fechamento automático de lote com relatórios detalhados ao zerar o estoque de aves.
- [x] **Vendas (PDV)**: Registro de vendas rápidas com cálculo automático de estoque de aves, valor total e opção de venda parcelada/fiada.
- [x] **Clientes (Fiado / Pagamentos)**: Controle de clientes endividados, lançamentos de pagamentos parciais ou totais e cálculo do saldo devedor consolidado.
- [x] **Financeiro**: 
  - Cadastro de **Despesas Operacionais** (luz, água, lenha) com filtragem mensal.
  - Registro de **Insumos** (vacinas e ração) direcionados a lotes específicos.
  - Registro de **Baixas** (mortes de aves) com justificativa e impacto automático no estoque.
- [x] **Relatórios Mensais de Lucratividade**: Visualização da receita, custo real (calculando o CMV incluindo rações consumidas, perdas por morte e taxas de frete/transporte prorrogadas) e lucro líquido, com layout otimizado para impressão fiscal.

---

## 📂 Estrutura do Projeto

```text
├── backend/                  # API RESTful em Express & Prisma
│   ├── prisma/               # Schema PostgreSQL e Migrations
│   ├── src/
│   │   ├── controllers/      # Controllers HTTP (lógica de fluxo)
│   │   ├── middlewares/      # Segurança (Auth JWT, Handler de erros)
│   │   ├── routes/           # Rotas públicas e protegidas por domínio
│   │   ├── services/         # Lógica de negócio e conexões com banco
│   │   └── types/            # Tipagens globais do Express
├── frontend/                 # Client React SPA em Vite
│   ├── src/
│   │   ├── @types/           # Definições de tipo e interfaces do negócio
│   │   ├── components/       # Componentes globais e modais (Batches, Sales, Finance, Layout)
│   │   ├── contexts/         # Contextos globais (Autenticação, Filtro de Data)
│   │   ├── hooks/            # Custom Hooks integrados ao TanStack Query
│   │   ├── lib/              # Validações Zod e instância Axios
│   │   ├── pages/            # Telas da aplicação (Dashboard, Lotes, Financeiro, Relatórios...)
│   │   └── styles/           # CSS Global e estilos utilitários
```

---

## 🚀 Como Rodar o Projeto

### **1. Clonar o repositório**
```bash
git clone https://github.com/victorlanga348/Aviarios.git
cd Aviarios
```

### **2. Configurar e rodar o Backend**
1. Acesse o diretório:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz da pasta `backend` com as variáveis:
   ```env
   DATABASE_URL="sua-url-do-postgresql"
   JWT_SECRET="sua-chave-secreta-jwt"
   PORT=3000
   ```
4. Aplique as migrations no banco de dados:
   ```bash
   npx prisma migrate dev
   ```
5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

### **3. Configurar e rodar o Frontend**
1. Acesse o diretório do frontend:
   ```bash
   cd ../frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor local:
   ```bash
   npm run dev -- --host
   ```
4. Abra o navegador no endereço indicado (normalmente `http://localhost:5173`).

---

## ✍️ Autor

Desenvolvido por **Victor Langa** como um sistema completo, altamente seguro e performático para informatizar o controle de aviários, demonstrando proficiência no desenvolvimento Full Stack robusto, manipulação de bancos de dados relacionais e implementação de interfaces modernas de alta usabilidade.

## Licença e Direitos Autorais

Este projecto é público apenas para fins de demonstração e avaliação.

O código, design, documentação, arquitectura e lógica de negócio do Aviarios Pro estão protegidos por direitos autorais.

Não é permitido copiar, reutilizar, modificar, vender, distribuir ou usar este projecto, total ou parcialmente, sem autorização prévia e por escrito dos autores.

Todos os direitos reservados.
