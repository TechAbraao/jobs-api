from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy

""" Database (Flask-SQLAlchemy Lib) """
database = SQLAlchemy()

"""Marshmallow extension (kept separate from the src.schemas package name)."""
marshmallow_ext = Marshmallow()