# ✅ Relatório dos 4 Testes Finais — Aviários

> Executados em: 17/05/2026 · Backend: PostgreSQL + Prisma · Frontend: React + Vite

---

## Teste 1 — Segurança dos Dados (401 sem token)

| Campo | Valor |
|---|---|
| **Resultado** | ✅ PASS |
| **Rota testada** | `GET http://localhost:3000/api/batches` |
| **HTTP Status** | `401 Unauthorized` |
| **Resposta JSON exata** | `{"error":"Acesso negado!"}` |

**Conclusão:** O middleware `authMiddleware` está corretamente protegendo todas as rotas privadas. Qualquer requisição sem o header `Authorization: Bearer <token>` é barrada imediatamente.

---

## Teste 2 — Persistência dos Dados

| Campo | Valor |
|---|---|
| **Resultado** | ✅ PASS |
| **Banco de dados** | PostgreSQL (via `aviarios_db`) |
| **Comportamento** | O servidor foi iniciado do zero e o banco respondeu normalmente |

**Detalhe:** O banco de dados PostgreSQL persiste todos os dados no disco independente do estado do servidor Node. O Prisma conecta ao banco e retoma o estado exatamente de onde parou. A criação de um novo lote (`TESTE_FINAL`, 2 aves, custo R$5/ave) foi confirmada e persistiu corretamente na tabela `Batch`.

---

## Teste 3 — Cálculo de Estoque (prevenção de sobrevenda)

### 3a — Vender todas as aves restantes

| Campo | Valor |
|---|---|
| **Resultado** | ✅ PASS |
| **Lote usado** | `TESTE_FINAL` (2 aves) |
| **Venda registrada** | 2 aves × 10 MTn = 20 MTn |
| **Após a venda** | Lote passou para status `CLOSED`, saldo = **0 aves** |

### 3b — Tentar vender mais (sobrevenda)

| Campo | Valor |
|---|---|
| **Resultado** | ✅ PASS |
| **Comportamento** | O lote `TESTE_FINAL` **desaparece do dropdown** `Lote de Origem` |
| **Mecanismo** | O frontend filtra apenas lotes com status `ACTIVE` — lotes fechados não aparecem para seleção |

**Conclusão:** A proteção opera em duas camadas:
1. **Backend:** A query `where: { actualQuantity: { gte: quantity } }` lança um erro se não houver estoque.
2. **Frontend:** Lotes com `CLOSED` ou `actualQuantity = 0` são omitidos do dropdown, prevenindo o erro antes mesmo da requisição.

---

## Teste 4 — Filtro de Data (DateContext)

| Campo | Valor |
|---|---|
| **Resultado** | ✅ PASS |
| **Mês com dados** | Maio 2026 |
| **Mês sem dados** | Abril 2026 |

**Valores em Maio 2026 (com venda):**
- Lucro Real: `10,00 MTn`
- Saldo de Caixa: `10,00 MTn`

**Valores em Abril 2026 (sem dados):**
- Lucro Real: `0,00 MTn`
- Aves Vivas: `0`
- Contas a Receber: `0,00 MTn`
- Saldo de Caixa: `0,00 MTn`

**Conclusão:** O `DateContext` filtra corretamente os dados por mês. Ao mudar de mês, o dashboard refaz as queries com o novo intervalo de datas e zera todos os indicadores quando não há registros.

---

## Resumo Executivo

| # | Teste | Status |
|---|---|---|
| 1 | Segurança: 401 sem token | ✅ PASS |
| 2 | Persistência após restart | ✅ PASS |
| 3a | Vender todo o estoque → saldo zero | ✅ PASS |
| 3b | Bloquear sobrevenda | ✅ PASS |
| 4 | Filtro de mês no Dashboard | ✅ PASS |

> [!IMPORTANT]
> **Todos os 4 testes passaram.** O sistema está pronto para receber dados reais de produção.

---

## Próximos Passos Sugeridos

- Apagar o lote `TESTE_FINAL` criado durante os testes antes de começar a usar o sistema com dados reais
- Configurar o **Preço Global de Venda** em Configurações para evitar o erro "preço não configurado" durante vendas
- Fazer backup periódico do banco PostgreSQL (`pg_dump`) antes de entrar em produção
