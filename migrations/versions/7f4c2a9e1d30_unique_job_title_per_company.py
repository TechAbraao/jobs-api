"""Enforce unique job titles per company (case-insensitive).

Revision ID: 7f4c2a9e1d30
Revises: 31a2c8f4d610
Create Date: 2026-10-21
"""

from alembic import op
import sqlalchemy as sa


revision = "7f4c2a9e1d30"
down_revision = "31a2c8f4d610"
branch_labels = None
depends_on = None


def upgrade():
    op.create_index(
        "uq_jobs_company_title_ci",
        "jobs",
        [sa.text("lower(trim(company))"), sa.text("lower(trim(title))")],
        unique=True,
    )


def downgrade():
    op.drop_index("uq_jobs_company_title_ci", table_name="jobs")
