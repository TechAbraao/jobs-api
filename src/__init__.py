from src.utils import db_postgres
from src.utils.settings import database, marshmallow_ext
from flask_migrate import Migrate
from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)


def create_app(test_config: dict[str, object] | None = None) -> Flask:
    app: Flask = Flask(__name__)
    CORS(app, resources={r"/jobs*": {"origins": "*"}, r"/auth*": {"origins": "*"}})
    app.config.update(
        SQLALCHEMY_DATABASE_URI=db_postgres.get_uri(),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JSON_SORT_KEYS=False,
    )
    if test_config:
        app.config.update(test_config)

    # Initialize extensions
    database.init_app(app)
    marshmallow_ext.init_app(app)

    # Import models before Flask-Migrate inspects SQLAlchemy metadata.
    from src.controllers.auth_ctr import ensure_default_admin
    from src.models import jobs_mdl  # noqa: F401
    from src.models import users_mdl  # noqa: F401
    from src.routes.auth_rts import auth_rts
    from src.routes.jobs_rts import jobs_rts

    app.register_blueprint(jobs_rts)
    app.register_blueprint(auth_rts)

    if app.config.get("TESTING"):
        with app.app_context():
            database.create_all()
            ensure_default_admin()

    logger.info(f"Registered blueprints: {app.blueprints.keys()}")

    @app.get("/health")
    def health():
        try:
            database.session.execute(text("SELECT 1"))
        except Exception:
            logger.exception("Health check database query failed")
            return jsonify({"status": "unhealthy", "database": "unavailable"}), 503
        return jsonify({"status": "ok", "database": "ok"}), 200

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({"error": "Recurso não encontrado."}), 404

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return jsonify({"error": "Método HTTP não permitido."}), 405

    Migrate(app, database, directory='migrations')

    return app