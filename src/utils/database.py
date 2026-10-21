import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()


class PostgresSQL:
    def get_uri(self) -> str:
        """Build the SQLAlchemy URI from DATABASE_URL or PostgreSQL variables."""
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            if database_url.startswith("postgres://"):
                return database_url.replace("postgres://", "postgresql+psycopg://", 1)
            if database_url.startswith("postgresql://"):
                return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
            return database_url

        host = os.getenv("POSTGRES_HOST") or os.getenv("DATABASE_HOST")
        port = os.getenv("POSTGRES_PORT") or os.getenv("DATABASE_PORT", "5432")
        database = os.getenv("POSTGRES_DB") or os.getenv("DATABASE_NAME")
        username = os.getenv("POSTGRES_USER")
        password = os.getenv("POSTGRES_PASSWORD")

        # SQLite makes a fresh checkout and local tests usable without a database server.
        if not all((host, database, username, password)):
            return os.getenv("SQLITE_DATABASE_URI", "sqlite:///jobs.db")

        return (
            f"postgresql+psycopg://{quote_plus(username)}:{quote_plus(password)}"
            f"@{host}:{port}/{quote_plus(database)}"
        )