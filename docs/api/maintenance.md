# API de Manutencao

## `GET /api/maintenance`

Endpoint publico para consultar o estado global de manutencao.

Resposta principal:

- `inMaintenance`: indica manutencao em andamento.
- `showAlert`: indica que deve existir aviso para manutencao agendada.
- `scheduledStart`: data/hora de inicio quando existir agendamento.
- `estimatedTime`: tempo estimado quando existir.
- `durationHours`: duracao estimada quando existir.
- `leadTimeHours`: antecedencia do aviso quando existir.
- `timeLeftText`: texto de proximidade quando o aviso previo esta ativo.
- `maintenance`: registo global de manutencao ou `null`.

## `POST /api/maintenance`

Endpoint administrativo protegido por autenticacao e permissao de admin.

Campos aceites:

- `isActive`
- `status`
- `type`
- `clientName`
- `equipment`
- `description`
- `estimatedTime`
- `scheduledStart`
- `durationHours`
- `leadTimeHours`
