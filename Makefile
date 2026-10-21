.PHONY: help setup install test run db-up db-down db-logs db-migrate db-upgrade db-downgrade db-current db-history clean

PYTHON ?= .venv/bin/python
FLASK := $(PYTHON) -m flask --app src.app
COMPOSE := docker compose -f infra/composes/docker-compose-dev.yml --env-file .env

help: ## Lista os comandos disponíveis
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-16s %s\n", $$1, $$2}'

setup: ## Cria o ambiente virtual e instala as dependências
	python3 -m venv .venv
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r requirements.txt

install: setup ## Alias para setup

test: ## Executa a suíte de testes
	$(PYTHON) -m pytest -q

run: ## Inicia a API Flask em modo de desenvolvimento
	$(FLASK) run

db-up: ## Sobe o PostgreSQL pelo Docker Compose
	$(COMPOSE) up -d

db-down: ## Para os serviços do Docker Compose sem apagar volumes
	$(COMPOSE) down

db-logs: ## Exibe os logs do PostgreSQL
	$(COMPOSE) logs -f postgres

db-migrate: ## Gera migração; use make db-migrate MSG="descrição"
	@test -n "$(MSG)" || (echo 'Informe uma mensagem: make db-migrate MSG="descrição"' && exit 1)
	$(FLASK) db migrate -m "$(MSG)"

db-upgrade: ## Aplica migrações pendentes e cria/atualiza as tabelas
	$(FLASK) db upgrade

db-downgrade: ## Reverte uma migração (padrão: um passo); use REVISION para escolher
	$(FLASK) db downgrade $(if $(REVISION),$(REVISION),-1)

db-current: ## Mostra a revisão aplicada no banco
	$(FLASK) db current

db-history: ## Lista o histórico de migrações
	$(FLASK) db history

clean: ## Remove arquivos temporários de Python e pytest
	$(PYTHON) -c "import shutil; shutil.rmtree('.pytest_cache', ignore_errors=True)"
	find . -type d -name __pycache__ -prune -exec rm -rf {} +
