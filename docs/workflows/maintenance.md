# Workflow de Manutencao

## Administrador

1. Acede ao painel Admin.
2. Configura tipo, descricao, estado, inicio agendado, duracao, aviso previo e tempo estimado quando aplicavel.
3. Guarda a configuracao.
4. Pode marcar a manutencao como agendada, em andamento, concluida, cancelada ou pendente.
5. Pode cancelar uma manutencao ativa ou agendada.

## Utilizador

1. A aplicacao consulta `GET /api/maintenance`.
2. Se houver manutencao agendada, mostra um aviso compacto.
3. Se houver manutencao em andamento, mostra um aviso mais forte, mas sem deslocar layout.
4. Ao abrir detalhes, o utilizador ve inicio, estado, tempo estimado, duracao e impacto quando esses dados existirem.
5. Quando a manutencao termina, o aviso deixa de ser persistente.
