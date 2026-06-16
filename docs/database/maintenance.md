# Entidade Maintenance

## Modelo

Tabela Prisma: `Maintenance`

Campos principais:

- `id`: identificador global, por padrao `global`.
- `status`: enum `MaintenanceStatus`.
- `type`: tipo da manutencao.
- `clientName`: cliente afetado, opcional.
- `equipment`: equipamento afetado, opcional.
- `description`: impacto ou descricao objetiva, opcional.
- `isActive`: indica manutencao em andamento.
- `estimatedTime`: tempo estimado, opcional.
- `scheduledStart`: data/hora de inicio agendado, opcional.
- `durationHours`: duracao estimada em horas, opcional.
- `leadTimeHours`: antecedencia do aviso, opcional.
- `updatedAt`: ultima atualizacao.

## Enum `MaintenanceStatus`

- `PENDENTE`
- `AGENDADA`
- `EM_ANDAMENTO`
- `CONCLUIDA`
- `CANCELADA`
