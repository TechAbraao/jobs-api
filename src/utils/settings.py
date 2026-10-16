from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy

""" Database (Flask-SQLAlchemy Lib) """
database = SQLAlchemy()

""" Schemas (Flask-Marshmallow Lib) """
schemas = Marshmallow()