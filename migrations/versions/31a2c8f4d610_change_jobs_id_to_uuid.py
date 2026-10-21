"""Change jobs primary key from integer to UUID.

Revision ID: 31a2c8f4d610
Revises: b615799b826b
Create Date: 2026-10-21
"""

import uuid

from alembic import op
import sqlalchemy as sa


revision = "31a2c8f4d610"
down_revision = "b615799b826b"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("jobs", sa.Column("id_uuid", sa.Uuid(), nullable=True))

    connection = op.get_bind()
    jobs = sa.table(
        "jobs",
        sa.column("id", sa.Integer()),
        sa.column("id_uuid", sa.Uuid()),
    )
    old_ids = connection.execute(sa.select(jobs.c.id)).scalars().all()
    for old_id in old_ids:
        connection.execute(
            jobs.update()
            .where(jobs.c.id == old_id)
            .values(id_uuid=uuid.uuid4())
        )

    with op.batch_alter_table("jobs", recreate="always") as batch_op:
        batch_op.drop_column("id")
        batch_op.alter_column(
            "id_uuid",
            new_column_name="id",
            existing_type=sa.Uuid(),
            nullable=False,
        )
        batch_op.create_primary_key("jobs_pkey", ["id"])


def downgrade():
    op.add_column("jobs", sa.Column("id_integer", sa.Integer(), nullable=True))

    connection = op.get_bind()
    jobs = sa.table(
        "jobs",
        sa.column("id", sa.Uuid()),
        sa.column("id_integer", sa.Integer()),
    )
    ids = connection.execute(sa.select(jobs.c.id).order_by(jobs.c.id)).scalars().all()
    for integer_id, job_id in enumerate(ids, start=1):
        connection.execute(
            jobs.update()
            .where(jobs.c.id == job_id)
            .values(id_integer=integer_id)
        )

    with op.batch_alter_table("jobs", recreate="always") as batch_op:
        batch_op.drop_column("id")
        batch_op.alter_column(
            "id_integer",
            new_column_name="id",
            existing_type=sa.Integer(),
            nullable=False,
        )
        batch_op.create_primary_key("jobs_pkey", ["id"])