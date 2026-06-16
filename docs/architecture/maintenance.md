# Arquitetura de Manutencao

## Frontend

- `frontend/src/routes/index.tsx` monta o aviso global de manutencao dentro do `AuthProvider`.
- `frontend/src/components/layout/MaintenanceBanner.tsx` consulta a API e renderiza uma badge fixa com modal de detalhes.
- `frontend/src/pages/Admin.tsx` renderiza a area de configuracao administrativa.
- `frontend/src/styles/index.css` nao deve conter regras que desloquem o layout por causa do aviso de manutencao.

## Backend

- `backend/src/routes/public/maintenance.routes.ts` expoe consulta publica e atualizacao administrativa.
- `backend/src/services/maintenanceService.ts` resolve os estados de manutencao, agendamento e janela de aviso.
- `backend/src/middlewares/maintenance.ts` aplica o bloqueio operacional para utilizadores comuns quando o backend considera a manutencao em andamento.

## Inconsistencia registada

A regra do projeto declara `/docs` como fonte oficial da verdade, mas nao havia documentacao de manutencao disponivel antes desta atualizacao. Esta especificacao passa a ser a referencia para futuras alteracoes da area de manutencao.
