# Eventos de Manutencao

## Frontend

### `maintenance_event`

Evento de browser emitido pelo interceptor de API quando uma resposta indica manutencao ativa.

Payload esperado:

- `estimatedTime`: tempo estimado opcional.

Comportamento:

- Atualiza o estado local do aviso para manutencao em andamento.
- Reabre a possibilidade de mostrar o aviso mesmo que tenha sido fechado antes.
- Nao desloca o layout da pagina.

## Socket.io

Nao ha eventos Socket.io de manutencao documentados nesta versao.
