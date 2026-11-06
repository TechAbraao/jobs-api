import uuid

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from src.models.jobs_mdl import JobsMdl
from src.models.users_mdl import UsersMdl
from src.utils.settings import database


class DuplicateUserError(Exception):
    """Raised when a username is already registered."""


class InvalidCredentialsError(Exception):
    """Raised for an invalid username/password pair."""


class UserNotFoundError(Exception):
    """Raised when an operation references a missing user."""


def _trim_username(username: str) -> str:
    return username.strip()


def ensure_default_admin() -> UsersMdl | None:
    if not database.inspect(database.engine).has_table("users"):
        return None

    admin = database.session.scalar(
        select(UsersMdl).where(func.lower(UsersMdl.username) == "admin")
    )
    if admin is not None:
        return admin

    admin = UsersMdl(username="admin", role="admin", favorite_jobs=[])
    admin.set_password("admin")
    database.session.add(admin)
    try:
        database.session.commit()
    except IntegrityError:
        database.session.rollback()
        return database.session.scalar(
            select(UsersMdl).where(func.lower(UsersMdl.username) == "admin")
        )
    return admin


def get_user_by_username(username: str) -> UsersMdl | None:
    normalized = _trim_username(username)
    return database.session.scalar(
        select(UsersMdl).where(func.lower(UsersMdl.username) == normalized.lower())
    )


def create_user(username: str, password: str, *, role: str = "user") -> UsersMdl:
    normalized = _trim_username(username)
    if not normalized:
        raise ValueError("username is required")

    normalized = normalized.strip()
    if get_user_by_username(normalized) is not None:
        raise DuplicateUserError

    user = UsersMdl(username=normalized, role=role or "user", favorite_jobs=[])
    user.set_password(password)
    database.session.add(user)
    try:
        database.session.commit()
    except IntegrityError as exc:
        database.session.rollback()
        raise DuplicateUserError from exc
    return user


def authenticate_user(username: str, password: str) -> UsersMdl:
    user = get_user_by_username(username)
    if user is None or not user.check_password(password):
        raise InvalidCredentialsError
    return user


def add_favorite_job(username: str, job_id: uuid.UUID) -> UsersMdl:
    user = get_user_by_username(username)
    if user is None:
        raise UserNotFoundError
    if database.session.get(JobsMdl, job_id) is None:
        raise ValueError("job not found")

    favorite_jobs = list(user.favorite_jobs or [])
    if str(job_id) not in favorite_jobs:
        favorite_jobs.append(str(job_id))
        user.favorite_jobs = favorite_jobs
        database.session.commit()
    return user


def remove_favorite_job(username: str, job_id: uuid.UUID) -> UsersMdl:
    user = get_user_by_username(username)
    if user is None:
        raise UserNotFoundError
    if database.session.get(JobsMdl, job_id) is None:
        raise ValueError("job not found")

    favorite_jobs = list(user.favorite_jobs or [])
    job_id_str = str(job_id)
    if job_id_str in favorite_jobs:
        favorite_jobs.remove(job_id_str)
        user.favorite_jobs = favorite_jobs
        database.session.commit()
    return user


def list_favorite_jobs(username: str) -> list[JobsMdl]:
    user = get_user_by_username(username)
    if user is None:
        raise UserNotFoundError

    favorite_job_ids = user.favorite_jobs or []
    return [
        job for job in database.session.query(JobsMdl).filter(JobsMdl.id.in_([uuid.UUID(value) for value in favorite_job_ids])).all()
    ]
