## Jobs API @ FATEC-ZL
 
API REST para cadastro e consulta de vagas, construída com Flask, SQLAlchemy e PostgreSQL.

### Configuração local

Execute os comandos a partir da raiz do projeto.

1. Crie o arquivo de ambiente e ajuste as configurações do PostgreSQL. `POSTGRES_DB` deve ser o nome do banco que a aplicação usará:

	```bash
	cp env.template .env
	```

2. Crie e ajuste o arquivo `.env`, depois crie o ambiente virtual e instale as dependências:

	```bash
	cp env.template .env
	make setup
	```

	O Makefile usa `.venv/bin/python` por padrão. Se necessário, sobrescreva o executável, por exemplo: `make test PYTHON=python3`.

3. Inicie o PostgreSQL:

	```bash
	make db-up
	```

   A imagem oficial do PostgreSQL cria o banco indicado por `POSTGRES_DB` **somente quando inicializa um diretório de dados vazio**. Se o volume `postgres_data` já existia, mudar `.env` ou recriar o container não cria outro banco. Nesse caso, crie o banco desejado no PostgreSQL ou configure a aplicação para apontar para um banco que já exista.

4. Com o PostgreSQL pronto e o banco criado, aplique as migrações versionadas para criar ou atualizar as tabelas:

	```bash
	make db-upgrade
	```

	Este repositório já contém a migração inicial da tabela `jobs`; no uso normal, basta executar `db upgrade`. O banco PostgreSQL precisa existir antes desse comando: Flask-Migrate/Alembic cria as tabelas dentro do banco, mas não cria o próprio banco.

5. Inicie a API:

	```bash
	make run
	```

Veja todos os comandos disponíveis com `make help`. Entre os principais estão `make test`, `make db-logs` e `make db-down` (este último para os containers sem apagar o volume do banco).

#### Criar migrações para alterações futuras

Quando um modelo for alterado, gere uma nova migração, revise o arquivo criado em `migrations/versions/` e aplique-a:

```bash
make db-migrate MSG="descreva a alteracao"
make db-upgrade
```

`db migrate` gera o arquivo de migração a partir das diferenças detectadas nos modelos; `db upgrade` executa as migrações pendentes. `db init` só é necessário para inicializar o diretório de migrações em um projeto que ainda não o possui — este repositório já tem `migrations/`, então não execute esse comando aqui.

Se as variáveis do PostgreSQL não estiverem configuradas, a aplicação usa `sqlite:///jobs.db` para desenvolvimento local. `DATABASE_URL` pode ser definido para fornecer uma URI diretamente.

### Frontend mobile (React Native / Expo)

A pasta `mobile/` contém a interface mobile que consome a API do backend. O app foi construído com Expo + React Native e usa a variável de ambiente `EXPO_PUBLIC_JOBS_API_URL` para apontar para a API REST.

1. A partir da raiz do projeto, abra a pasta do app:

   ```bash
   cd mobile
   ```

2. Instale as dependências do cliente mobile:

   ```bash
   npm install
   ```

3. Configure a URL da API antes de iniciar o app:

   ```bash
   export EXPO_PUBLIC_JOBS_API_URL=http://localhost:5000
   ```

   Em um emulador Android, normalmente a API fica disponível em `http://10.0.2.2:5000`.

4. Inicie o app:

   ```bash
   npm start
   ```

   Você também pode abrir diretamente:

   ```bash
   npm run android
   npm run ios
   npm run web
   ```

   O backend precisa estar em execução antes do app mobile iniciar. O cliente consome os endpoints da API de vagas e autenticação (`/jobs`, `/auth/register`, `/auth/login`, `/auth/favorites`, etc.).

   Consulte também o README específico em `mobile/README.md` para detalhes sobre as telas e integrações da interface.

### API

As respostas são JSON. Cada vaga recebe um identificador UUID gerado pela API. Campos obrigatórios: `title`, `description`, `company`, `location`, `url` (URL HTTP/HTTPS da vaga) e `platform` (plataforma que publicou/distribui a vaga). `salary` é opcional e não pode ser negativo. Uma mesma empresa não pode cadastrar duas vagas com o mesmo título; a comparação ignora maiúsculas/minúsculas e espaços nas extremidades. Em caso de duplicidade, a API retorna `409 Conflict`. Use o UUID retornado na criação para consultar, atualizar ou remover a vaga.

Além disso, a API expõe autenticação básica de usuários com `username` e `password`, hash da senha, `role` (`user` ou `admin`) e suporte a favoritos por usuário. O usuário administrador padrão é criado com:

```json
{
  "username": "admin",
  "password": "admin"
}
```

#### Endpoints gerais

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verifica a aplicação e a conexão com o banco. |

#### Endpoints de vagas

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/jobs` | Lista vagas, com filtros e paginação. |
| `POST` | `/jobs` | Cadastra uma vaga. |
| `GET` | `/jobs/<uuid>` | Consulta uma vaga. |
| `PUT` | `/jobs/<uuid>` | Substitui os campos obrigatórios da vaga. |
| `PATCH` | `/jobs/<uuid>` | Atualiza parcialmente a vaga. |
| `DELETE` | `/jobs/<uuid>` | Remove a vaga. |

`GET /jobs` aceita `page` (padrão 1), `per_page` (padrão 20, máximo 100), `q` (busca em título e descrição), `company`, `location`, `min_salary` e `max_salary`.

Exemplo de corpo para `POST /jobs`:

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

#### Endpoints de autenticação

| Método | Caminho | Descrição |
| --- | --- | --- |
| `POST` | `/auth/register` | Cadastra um novo usuário (`username` e `password`). |
| `POST` | `/auth/login` | Autentica o usuário e retorna o perfil. |
| `GET` | `/auth/favorites?username=<username>` | Lista as vagas favoritadas do usuário. |
| `POST` | `/auth/favorites` | Adiciona uma vaga aos favoritos do usuário. |
| `DELETE` | `/auth/favorites` | Remove uma vaga dos favoritos do usuário. |

Exemplo de cadastro:

```http
POST /auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "secret123"
}
```

Resposta esperada:

```json
{
  "user": {
    "id": "uuid",
    "username": "alice",
    "role": "user",
    "favorite_jobs": [],
    "created_at": "2026-11-05T00:00:00",
    "updated_at": "2026-11-05T00:00:00"
  }
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

Exemplo de adicionar favorito:

```http
POST /auth/favorites
Content-Type: application/json

{
  "username": "alice",
  "job_id": "<uuid-da-vaga>"
}
```

Exemplo de remoção de favorito:

```http
DELETE /auth/favorites
Content-Type: application/json

{
  "username": "alice",
  "job_id": "<uuid-da-vaga>"
}
```

Observações:
- `username` deve ter no mínimo 3 caracteres.
- `password` deve ter no mínimo 3 caracteres.
- O usuário `admin` já pode existir por padrão com senha `admin`.
- `favorite_jobs` é armazenado como lista de UUIDs no campo JSON do usuário.

### Migrações

As tabelas devem ser criadas e alteradas via Flask-Migrate/Alembic. Para criar a migração inicial, execute `flask --app src.app db init` (uma única vez), `flask --app src.app db migrate -m "create jobs table"` e `flask --app src.app db upgrade`.

### Testes

```bash
pytest
```
