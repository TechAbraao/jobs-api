# Hub Jobs

## 1. Visão geral

O Hub Jobs é uma API REST para gestão de vagas e um app mobile em React Native/Expo para consumo dessa API. O projeto foi organizado para manter a regra de negócio no backend e a interface mobile como cliente consumindo as rotas expostas.

O repositório contém:
- backend em Flask para autenticação, permissões e vagas
- frontend mobile em `mobile/`
- coleção de requisições Bruno em `assets/http/`
- pipeline de CI em `.circleci/`

## 2. Estrutura do projeto

2.1 Backend
- `src/`: controllers, rotas, modelos e utilitários da API
- `tests/`: testes automatizados do backend
- `migrations/`: histórico de migrações do banco

2.2 Frontend mobile
- `mobile/`: app em React Native/Expo
- `mobile/src/screens/`: telas principais
- `mobile/src/components/`: componentes reutilizáveis
- `mobile/src/services/jobsApi.js`: cliente HTTP para a API

2.3 Infra e documentação
- `assets/http/`: coleção Bruno para testes de endpoints
- `.circleci/config.yml`: pipeline de CI
- `AGENTS.md`: orientações para agentes e automações

## 3. Requisitos

3.1 Backend
- Python 3.12+
- PostgreSQL / SQLite para desenvolvimento local
- Flask, SQLAlchemy, Marshmallow, pytest

3.2 Mobile
- Node.js 20+
- Expo SDK
- React Native

## 4. Configuração local

4.1 Backend

Execute os comandos a partir da raiz do projeto.

1. Crie o arquivo de ambiente:

```bash
cp env.template .env
```

2. Ajuste as variáveis do PostgreSQL no `.env`.

`POSTGRES_DB` deve ser o nome do banco que a aplicação usará.

3. Crie o ambiente virtual e instale as dependências:

```bash
make setup
```

O Makefile usa `.venv/bin/python` por padrão. Se necessário, sobrescreva o executável:

```bash
make test PYTHON=python3
```

4. Inicie o PostgreSQL:

```bash
make db-up
```

Observação: a imagem oficial do PostgreSQL cria o banco indicado por `POSTGRES_DB` somente quando inicializa um diretório de dados vazio. Se o volume `postgres_data` já existia, mudar `.env` ou recriar o container não cria outro banco. Nesse caso, crie o banco manualmente no PostgreSQL ou ajuste a aplicação para apontar para um banco já existente.

5. Aplique as migrações:

```bash
make db-upgrade
```

6. Inicie a API:

```bash
make run
```

Comandos úteis:
- `make help`
- `make test`
- `make db-logs`
- `make db-down`

4.2 Migrações

Quando o modelo mudar, gere uma nova migração e aplique-a:

```bash
make db-migrate MSG="descreva a alteracao"
make db-upgrade
```

Se as variáveis do PostgreSQL não estiverem configuradas, a aplicação usa `sqlite:///jobs.db` em desenvolvimento local.

## 5. Frontend mobile

5.1 Configuração

1. Acesse a pasta do app:

```bash
cd mobile
```

2. Instale as dependências:

```bash
npm install
```

3. Defina a URL da API:

```bash
export EXPO_PUBLIC_JOBS_API_URL=http://localhost:5000
```

Em emulador Android, a URL costuma ser `http://10.0.2.2:5000`.

4. Inicie o app:

```bash
npm start
```

Outros comandos úteis:

```bash
npm run android
npm run ios
npm run web
```

O app mobile consome os endpoints de vagas e autenticação, como `/jobs`, `/auth/register`, `/auth/login`, `/auth/favorites` e `/auth/users`.

## 6. API

### 6.1 Visão geral

As respostas são JSON. Cada vaga recebe um UUID gerado pela API.

Campos obrigatórios da vaga:
- `title`
- `description`
- `company`
- `location`
- `url`
- `platform`

`salary` é opcional e não pode ser negativo.

Uma mesma empresa não pode cadastrar duas vagas com o mesmo título. A comparação ignora maiúsculas/minúsculas e espaços nas extremidades.

### 6.2 Endpoints gerais

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verifica a API e a conexão com o banco. |

### 6.3 Endpoints de vagas

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/jobs` | Lista vagas com filtros e paginação. |
| `POST` | `/jobs` | Cadastra uma vaga. |
| `GET` | `/jobs/<uuid>` | Consulta uma vaga. |
| `PUT` | `/jobs/<uuid>` | Substitui os dados da vaga. |
| `PATCH` | `/jobs/<uuid>` | Atualiza parcialmente a vaga. |
| `DELETE` | `/jobs/<uuid>` | Remove uma vaga. |

Parâmetros suportados em `GET /jobs`:
- `page`
- `per_page`
- `q`
- `company`
- `location`
- `min_salary`
- `max_salary`

Exemplo de payload para criar vaga:

```json
{
  "title": "Desenvolvedor Python",
  "description": "Desenvolvimento de serviços web",
  "company": "Exemplo Tecnologia",
  "location": "São Paulo, SP",
  "url": "https://careers.example.com/vagas/desenvolvedor-python",
  "platform": "Gupy",
  "salary": 8500,
  "modality": "Hybrid",
  "category": "Engineering",
  "contract": "CLT",
  "level": "Mid",
  "requirements": ["Python", "Flask", "PostgreSQL"],
  "benefits": "Vale transporte e plano de saúde",
  "tempo": "published 24h ago"
}
```

### 6.4 Endpoints de autenticação e usuários

| Método | Caminho | Descrição |
| --- | --- | --- |
| `POST` | `/auth/register` | Cadastra um usuário. |
| `POST` | `/auth/login` | Autentica e retorna o perfil. |
| `GET` | `/auth/users` | Lista usuários e seus UUIDs de vagas favoritadas. |
| `DELETE` | `/auth/users/<userId>` | Remove um usuário pelo UUID. |
| `GET` | `/auth/favorites?username=<username>` | Lista as vagas favoritadas do usuário. |
| `POST` | `/auth/favorites` | Adiciona uma vaga aos favoritos. |
| `DELETE` | `/auth/favorites` | Remove uma vaga dos favoritos. |

Exemplo de cadastro:

```http
POST /auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "secret123"
}
```

Exemplo de login:

```http
POST /auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "secret123"
}
```

Exemplo de resposta de usuários:

```json
{
  "users": [
    {
      "id": "uuid",
      "username": "alice",
      "role": "user",
      "favorite_jobs": ["uuid-da-vaga"]
    }
  ]
}
```

Exemplo de favorito:

```http
POST /auth/favorites
Content-Type: application/json

{
  "username": "alice",
  "job_id": "<uuid-da-vaga>"
}
```

Observações:
- `username` deve ter no mínimo 3 caracteres.
- `password` deve ter no mínimo 3 caracteres.
- O usuário `admin` já é criado por padrão com senha `admin`.
- Usuários `admin` não possuem lista de favoritos.

## 7. Testes

```bash
pytest
```

## 8. Coleção Bruno

A pasta `assets/http/` contém os endpoints exportados para uso no Bruno.

Você pode importar a coleção e testar os endpoints de autenticação, usuários, vagas e favoritos diretamente no cliente HTTP.

## 9. Observações importantes

- O backend é responsável pelas regras de negócio e autenticação.
- O mobile deve consumir a API e não duplicar a lógica do backend.
- Preserve compatibilidade com endpoints e payloads já existentes.
