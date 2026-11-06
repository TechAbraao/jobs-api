# AGENTS.md

## Visão geral
Este repositório contém uma API REST em Flask para gestão de vagas e um frontend mobile em React Native/Expo em `mobile/`.

## Estrutura principal
- `src/`: backend Flask, controllers, rotas, modelos e utilitários.
- `tests/`: testes automatizados do backend.
- `mobile/`: aplicação React Native/Expo consumindo a API.
- `.circleci/`: pipeline de CI/CD.
- `assets/http/`: coleções Bruno para chamadas HTTP.

## Tecnologias
- Backend: Python 3, Flask, SQLAlchemy, Marshmallow, pytest.
- Frontend mobile: React Native, Expo, React Native Paper, Expo Vector Icons.
- CI: CircleCI.

## Regras importantes para agents
- Preservar a separação entre backend e mobile.
- Não alterar a API sem validar o impacto nos consumidores mobile e nos testes.
- O backend é a fonte de verdade para autenticação, permissões e dados das vagas.
- O app mobile deve consumir a API via `mobile/src/services/jobsApi.js` e não duplicar regras de negócio no frontend.
- Não remover ou quebrar a autenticação de usuários e admin.
- Sempre manter a compatibilidade com os endpoints existentes e com o comportamento dos testes.
- Ao criar novos endpoints ou alterar payloads, também ajustar a coleção Bruno em `assets/http` quando necessário.

## Fluxo de autenticação
- Usuário comum e admin entram pela mesma tela de login.
- O campo `role` determina se o usuário vê recursos administrativos.
- Usuários autenticados têm acesso ao endpoint de vagas.
- Apenas usuários `admin` acessam o painel administrativo de CRUD de vagas.

## Fluxo de vagas
- A API de vagas está em `src/routes/jobs_rts.py` / `src/controllers/jobs_ctr.py`.
- Regras de negócio importantes:
  - uma empresa não pode ter duas vagas com o mesmo título
  - validações de payload e UUID devem ser preservadas
  - o endpoint de listagem suporta filtros e paginação

## Frontend mobile
- O app principal fica em `mobile/App.js`.
- Telas e componentes estão em `mobile/src/screens/` e `mobile/src/components/`.
- A URL da API padrão usa `EXPO_PUBLIC_JOBS_API_URL`; em Android a base padrão é `http://10.0.2.2:5000`.
- Quando editar o mobile, priorizar a compatibilidade com Expo/React Native e evitar dependências que exijam configuração extra no projeto.

## Testes e validação
- Backend: `python -m pytest -q`
- Mobile: a validação do projeto deve preferencialmente usar `npm ci` + `npx expo-doctor` + `npx expo export` no diretório `mobile/`.
- Qualquer mudança relevante em API, autenticação, permissões ou fundo de vagas deve ser acompanhada por testes e validação do fluxo.

## Boas práticas
- Mantenha mensagens em português para o usuário final.
- Preserve nomes de campos já existentes (`title`, `company`, `location`, `salary`, etc.).
- Use código limpo, com foco em estabilidade e compatibilidade.
- Se adicionar novas features, atualize documentação relevante quando necessário.

## Observações do projeto
- O backend é a camada responsável pelas regras de negócio e autenticação.
- O mobile deve funcionar como consumidor da API e não como reimplementação da lógica backend.
- Priorize alterações pequenas, específicas e compatíveis com o estado atual do projeto.
