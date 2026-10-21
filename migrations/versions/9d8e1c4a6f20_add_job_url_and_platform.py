"""Add job URL and publishing platform.

Revision ID: 9d8e1c4a6f20
Revises: 7f4c2a9e1d30
Create Date: 2026-10-21
"""

from alembic import op
import sqlalchemy as sa


revision = "9d8e1c4a6f20"
down_revision = "7f4c2a9e1d30"
branch_labels = None
depends_on = None


def upgrade():
    # Nullable columns preserve existing job records; API validation requires them on new jobs.
    op.add_column("jobs", sa.Column("url", sa.String(length=2048), nullable=True))
    op.add_column("jobs", sa.Column("platform", sa.String(length=100), nullable=True))


def downgrade():
    op.drop_column("jobs", "platform")
    op.drop_column("jobs", "url")
