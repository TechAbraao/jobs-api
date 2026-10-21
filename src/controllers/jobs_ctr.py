from sqlalchemy import or_

from src.models.jobs_mdl import JobsMdl
from src.utils.settings import database


def list_jobs(
	*, page: int, per_page: int, query: str | None = None,
	company: str | None = None, location: str | None = None,
	min_salary: float | None = None, max_salary: float | None = None,
) -> tuple[list[JobsMdl], int]:
	statement = database.select(JobsMdl)
	count_statement = database.select(database.func.count()).select_from(JobsMdl)

	if query:
		term = f"%{query.strip()}%"
		condition = or_(JobsMdl.title.ilike(term), JobsMdl.description.ilike(term))
		statement = statement.where(condition)
		count_statement = count_statement.where(condition)
	if company:
		condition = JobsMdl.company.ilike(f"%{company.strip()}%")
		statement = statement.where(condition)
		count_statement = count_statement.where(condition)
	if location:
		condition = JobsMdl.location.ilike(f"%{location.strip()}%")
		statement = statement.where(condition)
		count_statement = count_statement.where(condition)
	if min_salary is not None:
		condition = JobsMdl.salary >= min_salary
		statement = statement.where(condition)
		count_statement = count_statement.where(condition)
	if max_salary is not None:
		condition = JobsMdl.salary <= max_salary
		statement = statement.where(condition)
		count_statement = count_statement.where(condition)

	total = database.session.scalar(count_statement) or 0
	jobs = database.session.scalars(
		statement.order_by(JobsMdl.created_at.desc(), JobsMdl.id.desc())
		.offset((page - 1) * per_page)
		.limit(per_page)
	).all()
	return list(jobs), total


def create_job(data: dict[str, object]) -> JobsMdl:
	job = JobsMdl(**data)
	database.session.add(job)
	database.session.commit()
	return job


def get_job(job_id: int) -> JobsMdl | None:
	return database.session.get(JobsMdl, job_id)


def update_job(job: JobsMdl, data: dict[str, object]) -> JobsMdl:
	for field, value in data.items():
		setattr(job, field, value)
	database.session.commit()
	return job


def delete_job(job: JobsMdl) -> None:
	database.session.delete(job)
	database.session.commit()
