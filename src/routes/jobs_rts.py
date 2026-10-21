from math import ceil

from flask import Blueprint, current_app, jsonify, request
from marshmallow import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from src.controllers import jobs_ctr
from src.schemas.http import JobSchema, JobUpdateSchema, validation_details

jobs_rts = Blueprint("jobs_rts", __name__, url_prefix="/jobs")
job_schema = JobSchema()
job_update_schema = JobUpdateSchema()


def _error(message: str, status: int, details: object | None = None):
    body: dict[str, object] = {"error": message}
    if details is not None:
        body["details"] = details
    return jsonify(body), status


def _json_body() -> dict[str, object] | None:
    body = request.get_json(silent=True)
    return body if isinstance(body, dict) else None


@jobs_rts.route("", methods=["POST"])
def create_job():
    body = _json_body()
    if body is None:
        return _error("O corpo da requisição deve ser um objeto JSON.", 400)
    try:
        data = job_schema.load(body)
        job = jobs_ctr.create_job(data)
    except ValidationError as error:
        return _error("Dados inválidos.", 400, validation_details(error))
    except jobs_ctr.DuplicateJobError:
        return _error("Esta empresa já possui uma vaga com esse título.", 409)
    except SQLAlchemyError:
        current_app.logger.exception("Failed to create job")
        return _error("Não foi possível salvar a vaga.", 500)
    return jsonify({"job": job.to_dict()}), 201

@jobs_rts.route("", methods=["GET"])
def get_jobs():
    try:
        page = int(request.args.get("page", "1"))
        per_page = int(request.args.get("per_page", "20"))
        min_salary = _optional_float("min_salary")
        max_salary = _optional_float("max_salary")
    except ValueError:
        return _error("page, per_page e salários devem ser números válidos.", 400)
    if page < 1 or per_page < 1 or per_page > 100:
        return _error("page deve ser >= 1 e per_page deve estar entre 1 e 100.", 400)
    if min_salary is not None and min_salary < 0 or max_salary is not None and max_salary < 0:
        return _error("Os filtros de salário não podem ser negativos.", 400)
    if min_salary is not None and max_salary is not None and min_salary > max_salary:
        return _error("min_salary não pode ser maior que max_salary.", 400)

    try:
        jobs, total = jobs_ctr.list_jobs(
            page=page,
            per_page=per_page,
            query=request.args.get("q"),
            company=request.args.get("company"),
            location=request.args.get("location"),
            min_salary=min_salary,
            max_salary=max_salary,
        )
    except SQLAlchemyError:
        current_app.logger.exception("Failed to list jobs")
        return _error("Não foi possível consultar as vagas.", 500)
    return jsonify({
        "jobs": [job.to_dict() for job in jobs],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": ceil(total / per_page),
        },
    }), 200


@jobs_rts.route("/<uuid:job_id>", methods=["GET"])
def get_job(job_id):
    try:
        job = jobs_ctr.get_job(job_id)
    except SQLAlchemyError:
        current_app.logger.exception("Failed to retrieve job %s", job_id)
        return _error("Não foi possível consultar a vaga.", 500)
    if job is None:
        return _error("Vaga não encontrada.", 404)
    return jsonify({"job": job.to_dict()}), 200


@jobs_rts.route("/<uuid:job_id>", methods=["PUT", "PATCH"])
def update_job(job_id):
    body = _json_body()
    if body is None:
        return _error("O corpo da requisição deve ser um objeto JSON.", 400)
    if not body:
        return _error("Informe ao menos um campo para atualizar.", 400)
    try:
        data = (job_schema if request.method == "PUT" else job_update_schema).load(body)
    except ValidationError as error:
        return _error("Dados inválidos.", 400, validation_details(error))

    try:
        job = jobs_ctr.get_job(job_id)
        if job is None:
            return _error("Vaga não encontrada.", 404)
        job = jobs_ctr.update_job(job, data)
    except jobs_ctr.DuplicateJobError:
        return _error("Esta empresa já possui uma vaga com esse título.", 409)
    except SQLAlchemyError:
        current_app.logger.exception("Failed to update job %s", job_id)
        return _error("Não foi possível atualizar a vaga.", 500)
    return jsonify({"job": job.to_dict()}), 200


@jobs_rts.route("/<uuid:job_id>", methods=["DELETE"])
def delete_job(job_id):
    try:
        job = jobs_ctr.get_job(job_id)
        if job is None:
            return _error("Vaga não encontrada.", 404)
        jobs_ctr.delete_job(job)
    except SQLAlchemyError:
        current_app.logger.exception("Failed to delete job %s", job_id)
        return _error("Não foi possível excluir a vaga.", 500)
    return "", 204


def _optional_float(parameter: str) -> float | None:
    value = request.args.get(parameter)
    if value is None:
        return None
    return float(value)
