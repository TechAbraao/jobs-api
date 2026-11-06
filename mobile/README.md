# Jobs Mobile

Aplicativo React Native para consultar vagas e gerenciar o catálogo de oportunidades via API REST.

## Funcionalidades

- Listagem de vagas e filtros
- Detalhes da vaga
- Favoritos
- Painel administrativo para criar, editar e remover vagas
- Integração com a API do projeto `jobs-api`

## Configuração da API

A aplicação usa a variável de ambiente `EXPO_PUBLIC_JOBS_API_URL` para encontrar a API REST.

Exemplo:

```bash
export EXPO_PUBLIC_JOBS_API_URL=http://localhost:5000
```

Para Android em emulador, o valor padrão já é `http://10.0.2.2:5000`.

## Como rodar

```bash
npm install
npm start
```

Em seguida, escolha o simulador ou dispositivo para abrir o app.

## Login e roles

O app inicia com uma tela de autenticação. Usuários comuns acessam a listagem de vagas e favoritos, enquanto o perfil `admin` também recebe acesso ao painel administrativo para criar, editar e remover vagas.

Credenciais padrão para teste:

```bash
usuário: admin
senha: admin
```

## Painel administrativo

No início do app, há o botão `Painel administrativo` que permite:

- cadastrar uma nova vaga
- editar uma vaga existente
- excluir uma vaga
- pesquisar vagas já cadastradas

A integração usa os endpoints da API REST do `jobs-api`:

- `GET /jobs`
- `POST /jobs`
- `GET /jobs/:id`
- `PATCH /jobs/:id`
- `PUT /jobs/:id`
- `DELETE /jobs/:id`
