## Jobs API

API REST para cadastro e consulta de vagas, construída com Flask, SQLAlchemy e PostgreSQL.

### Configuração local

Copie `env.template` para `.env` e ajuste as credenciais. Suba o PostgreSQL:

```bash
docker compose -f infra/composes/docker-compose-dev.yml --env-file .env up -d
```

Instale as dependências e inicie a aplicação:

```bash
pip install -r requirements.txt
flask --app src.app run
```

Se as variáveis do PostgreSQL não estiverem configuradas, a aplicação usa `sqlite:///jobs.db` para desenvolvimento local. `DATABASE_URL` pode ser definido para fornecer uma URI diretamente.

### API

As respostas são JSON. Campos obrigatórios de uma vaga: `title`, `description`, `company` e `location`. `salary` é opcional e não pode ser negativo.

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verifica a aplicação e a conexão com o banco. |
| `GET` | `/jobs` | Lista vagas, com filtros e paginação. |
| `POST` | `/jobs` | Cadastra uma vaga. |
| `GET` | `/jobs/<id>` | Consulta uma vaga. |
| `PUT` | `/jobs/<id>` | Substitui os campos obrigatórios da vaga. |
| `PATCH` | `/jobs/<id>` | Atualiza parcialmente a vaga. |
| `DELETE` | `/jobs/<id>` | Remove a vaga. |

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
