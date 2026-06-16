# Manutencao

## Objetivo

A manutencao global informa utilizadores e administradores sobre indisponibilidade agendada ou em andamento sem alterar a posicao do conteudo principal da aplicacao.

## Estados

- `PENDENTE`: nao ha manutencao ativa ou aviso relevante.
- `AGENDADA`: existe uma manutencao futura com `scheduledStart`.
- `EM_ANDAMENTO`: a manutencao esta ativa e pode limitar operacoes para utilizadores comuns.
- `CONCLUIDA`: a manutencao terminou.
- `CANCELADA`: a manutencao foi cancelada.

## Interface

- O painel Admin mostra apenas o estado atual, titulo curto, descricao objetiva, tempo estimado quando informado e acoes de guardar/cancelar.
- O aviso global deve ser fixo/sobreposto e nunca deve adicionar `padding`, `margin` ou deslocar headers, sidebars ou conteudo.
- Em desktop, o aviso aparece como badge compacta no canto superior direito.
- Em mobile, o aviso permanece compacto, fechavel e limitado a largura do viewport.
- Ao clicar no aviso, a aplicacao abre um modal pequeno com detalhes.
- Quando a manutencao esta concluida, a interface nao deve manter aviso persistente.

## Regras

- O aviso nao pode bloquear formularios, botoes principais ou navegacao mobile.
- O aviso deve ter texto claro e nao depender apenas de cor.
- Detalhes opcionais so aparecem quando existem dados reais.
- A manutencao em andamento continua a ser governada pelas regras do backend.
