import uuid

from flask import Blueprint, current_app, jsonify, request
from marshmallow import RAISE, Schema, ValidationError, fields, validate

from src.controllers import auth_ctr
from src.schemas.http import validation_details


auth_rts = Blueprint("auth_rts", __name__, url_prefix="/auth")


class RegisterUserSchema(Schema):
    class Meta:
        unknown = RAISE

    username = fields.String(required=True, validate=validate.Length(min=3, max=80))
    password = fields.String(required=True, validate=validate.Length(min=3, max=255))
    role = fields.String(load_default="user", validate=validate.OneOf(["user", "admin"]))


class LoginUserSchema(Schema):
    class Meta:
        unknown = RAISE

    username = fields.String(required=True, validate=validate.Length(min=3, max=80))
    password = fields.String(required=True, validate=validate.Length(min=3, max=255))


class FavoriteSchema(Schema):
    class Meta:
        unknown = RAISE

    username = fields.String(required=True, validate=validate.Length(min=3, max=80))
    job_id = fields.String(required=True)


def _error(message: str, status: int, details: object | None = None):
    body: dict[str, object] = {"error": message}
    if details is not None:
        body["details"] = details
    return jsonify(body), status


def _json_body() -> dict[str, object] | None:
    body = request.get_json(silent=True)
    return body if isinstance(body, dict) else None


@auth_rts.route("/register", methods=["POST"])
def register_user():
    body = _json_body()
    if body is None:
        return _error("O corpo da requisição deve ser um objeto JSON.", 400)
    try:
        data = RegisterUserSchema().load(body)
        user = auth_ctr.create_user(data["username"], data["password"], role=data.get("role", "user"))
    except ValidationError as error:
        return _error("Dados inválidos.", 400, validation_details(error))
    except auth_ctr.DuplicateUserError:
        return _error("Este usuário já existe.", 409)
    except ValueError as error:
        return _error(str(error), 400)
    except Exception:
        current_app.logger.exception("Failed to register user")
        return _error("Não foi possível cadastrar o usuário.", 500)
    return jsonify({"user": user.to_dict()}), 201


@auth_rts.route("/login", methods=["POST"])
def login_user():
    body = _json_body()
    if body is None:
        return _error("O corpo da requisição deve ser um objeto JSON.", 400)
    try:
        data = LoginUserSchema().load(body)
        user = auth_ctr.authenticate_user(data["username"], data["password"])
    except ValidationError as error:
        return _error("Dados inválidos.", 400, validation_details(error))
    except auth_ctr.InvalidCredentialsError:
        return _error("Credenciais inválidas.", 401)
    except Exception:
        current_app.logger.exception("Failed to login user")
        return _error("Não foi possível autenticar o usuário.", 500)
    return jsonify({"user": user.to_dict()}), 200


@auth_rts.route("/favorites", methods=["GET"])
def list_favorites():
    username = request.args.get("username")
    if not username:
        return _error("Parâmetro 'username' é obrigatório.", 400)
    try:
        jobs = auth_ctr.list_favorite_jobs(username)
    except auth_ctr.UserNotFoundError:
        return _error("Usuário não encontrado.", 404)
    except Exception:
        current_app.logger.exception("Failed to list favorites")
        return _error("Não foi possível consultar os favoritos.", 500)
    return jsonify({"favorite_jobs": [job.to_dict() for job in jobs]}), 200


@auth_rts.route("/favorites", methods=["POST", "DELETE"])
def manage_favorites():
    body = _json_body()
    if body is None:
        return _error("O corpo da requisição deve ser um objeto JSON.", 400)
    try:
        data = FavoriteSchema().load(body)
        user_name = data["username"]
        job_id = uuid.UUID(str(data["job_id"]))
    except (ValidationError, ValueError) as error:
        return _error("Dados inválidos.", 400, validation_details(error) if isinstance(error, ValidationError) else {"job_id": ["job_id deve ser um UUID válido."]})

    try:
        if request.method == "POST":
            user = auth_ctr.add_favorite_job(user_name, job_id)
            return jsonify({"message": "Vaga adicionada aos favoritos.", "user": user.to_dict()}), 200
        user = auth_ctr.remove_favorite_job(user_name, job_id)
        return jsonify({"message": "Vaga removida dos favoritos.", "user": user.to_dict()}), 200
    except auth_ctr.UserNotFoundError:
        return _error("Usuário não encontrado.", 404)
    except ValueError as error:
        return _error(str(error), 404 if "job not found" in str(error).lower() else 400)
    except Exception:
        current_app.logger.exception("Failed to update favorites")
        return _error("Não foi possível atualizar os favoritos.", 500)
