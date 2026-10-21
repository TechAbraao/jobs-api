import uuid

from src.utils.settings import database as db


class JobsMdl(db.Model):
    __tablename__ = "jobs"
    __table_args__ = (
        db.Index(
            "uq_jobs_company_title_ci",
            db.text("lower(trim(company))"),
            db.text("lower(trim(title))"),
            unique=True,
        ),
    )

    id = db.Column(db.Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    company = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(2048), nullable=True)
    platform = db.Column(db.String(100), nullable=True)
    salary = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def to_dict(self) -> dict[str, object]:
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "company": self.company,
            "location": self.location,
            "url": self.url,
            "platform": self.platform,
            "salary": self.salary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }