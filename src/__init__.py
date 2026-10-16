from src.utils.settings import database, schemas
from src.routes.jobs_rts import jobs_rts
from flask_migrate import Migrate
from flask import Flask
import logging

logger = logging.getLogger(__name__)

def create_app() -> Flask:
    app: Flask = Flask(__name__)

    # Initialize extensions
    database.init_app(app)
    schemas.init_app(app)

    # Import and register blueprints here
    # from .views import main_blueprint
    # app.register_blueprint(main_blueprint)
    app.register_blueprint(jobs_rts)
    logger.info(f"Registered blueprints: {app.blueprints.keys()}")

    app.config['SQLALCHEMY_DATABASE_URI'] = None

    return app