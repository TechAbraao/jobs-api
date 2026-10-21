## Jobs API @ FATEC-ZL
 
API REST para cadastro e consulta de vagas, construída com Flask, SQLAlchemy e PostgreSQL.

### Configuração local

Execute os comandos a partir da raiz do projeto.

1. Crie o arquivo de ambiente e ajuste as configurações do PostgreSQL. `POSTGRES_DB` deve ser o nome do banco que a aplicação usará:

	```bash
	cp env.template .env
	```

2. Crie e ative o ambiente virtual, instale as dependências e inicie o container do banco:

	```bash
	python3 -m venv .venv
	source .venv/bin/activate
	pip install -r requirements.txt
	docker compose -f infra/composes/docker-compose-dev.yml --env-file .env up -d
	```

3. A imagem oficial do PostgreSQL cria o banco indicado por `POSTGRES_DB` **somente quando inicializa um diretório de dados vazio**. Se o volume `postgres_data` já existia, mudar `.env` ou recriar o container não cria outro banco. Nesse caso, crie o banco desejado no PostgreSQL ou configure a aplicação para apontar para um banco que já exista.

4. Com o PostgreSQL pronto e o banco criado, aplique as migrações versionadas para criar ou atualizar as tabelas:

	```bash
	flask --app src.app db upgrade
	```

	Este repositório já contém a migração inicial da tabela `jobs`; no uso normal, basta executar `db upgrade`. O banco PostgreSQL precisa existir antes desse comando: Flask-Migrate/Alembic cria as tabelas dentro do banco, mas não cria o próprio banco.

5. Inicie a API:

	```bash
	flask --app src.app run
	```

Se o comando `flask` não for encontrado, confirme que o ambiente virtual está ativado ou execute pelo caminho do ambiente: `.venv/bin/flask --app src.app db upgrade` e `.venv/bin/flask --app src.app run`.

#### Criar migrações para alterações futuras

Quando um modelo for alterado, gere uma nova migração, revise o arquivo criado em `migrations/versions/` e aplique-a:

```bash
flask --app src.app db migrate -m "descreva a alteracao"
flask --app src.app db upgrade
```

`db migrate` gera o arquivo de migração a partir das diferenças detectadas nos modelos; `db upgrade` executa as migrações pendentes. `db init` só é necessário para inicializar o diretório de migrações em um projeto que ainda não o possui — este repositório já tem `migrations/`, então não execute esse comando aqui.

Se as variáveis do PostgreSQL não estiverem configuradas, a aplicação usa `sqlite:///jobs.db` para desenvolvimento local. `DATABASE_URL` pode ser definido para fornecer uma URI diretamente.

### API

As respostas são JSON. Cada vaga recebe um identificador UUID gerado pela API. Campos obrigatórios: `title`, `description`, `company` e `location`. `salary` é opcional e não pode ser negativo. Use o UUID retornado na criação para consultar, atualizar ou remover a vaga.

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verifica a aplicação e a conexão com o banco. |
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
	"salary": 8500
}
```

### Migrações

As tabelas devem ser criadas e alteradas via Flask-Migrate/Alembic. Para criar a migração inicial, execute `flask --app src.app db init` (uma única vez), `flask --app src.app db migrate -m "create jobs table"` e `flask --app src.app db upgrade`.

### Testes

```bash
pytest
```
