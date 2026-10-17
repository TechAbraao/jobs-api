from dataclasses import dataclass
from dotenv import load_dotenv
import os

load_dotenv()

@dataclass
class PostgresSQL:
    DATABASE_HOST: str = os.getenv("DATABASE_HOST")
    DATABASE_PORT: int = os.getenv("DATABASE_PORT")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB")
    
    def get_uri(self) -> str:
        """
        Returns the full URI in the format accepted by SQLAlchemy
        postgresql://USER:PASSWORD@HOST:PORT/DATABASE
        """
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )