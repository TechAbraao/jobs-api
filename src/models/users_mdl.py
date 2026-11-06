import uuid

from werkzeug.security import check_password_hash, generate_password_hash

from src.utils.settings import database


class UsersMdl(database.Model):
    __tablename__ = "users"

    id = database.Column(database.Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = database.Column(database.String(80), unique=True, nullable=False, index=True)
    password_hash = database.Column(database.String(255), nullable=False)
    role = database.Column(database.String(50), nullable=False, default="user")
    favorite_jobs = database.Column(database.JSON, nullable=False, default=list)
    created_at = database.Column(database.DateTime, default=database.func.current_timestamp())
    updated_at = database.Column(
        database.DateTime,
        default=database.func.current_timestamp(),
        onupdate=database.func.current_timestamp(),
    )

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict[str, object]:
        favorite_jobs = self.favorite_jobs or []
        return {
            "id": str(self.id),
            "username": self.username,
            "role": self.role,
            "favorite_jobs": [str(job_id) for job_id in favorite_jobs],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
