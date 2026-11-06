import uuid

import pytest
from sqlalchemy.exc import SQLAlchemyError

from src import create_app
from src.controllers import jobs_ctr
from src.utils.settings import database


@pytest.fixture()
def app():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    with app.app_context():
        database.create_all()
        yield app
        database.session.remove()
        database.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def job_payload(**overrides):
    payload = {
        "title": "Backend Developer",
        "description": "Build APIs with Python",
        "company": "Example Inc.",
        "location": "Remote",
        "url": "https://jobs.example.com/backend-developer",
        "platform": "LinkedIn",
        "salary": 9000,
        "modality": "Remote",
        "category": "Engineering",
        "contract": "CLT",
        "level": "Mid",
        "requirements": ["Python", "Flask"],
        "benefits": "Health plan and meal voucher",
        "tempo": "published 24h ago",
    }
    payload.update(overrides)
    return payload


def test_create_and_get_job(client):
    response = client.post("/jobs", json=job_payload())

    assert response.status_code == 201
    created = response.get_json()["job"]
    assert str(uuid.UUID(created["id"])) == created["id"]
    assert created["title"] == "Backend Developer"
    assert created["url"] == "https://jobs.example.com/backend-developer"
    assert created["platform"] == "LinkedIn"
    assert created["salary"] == 9000
    assert created["modality"] == "Remote"
    assert created["category"] == "Engineering"
    assert created["contract"] == "CLT"
    assert created["level"] == "Mid"
    assert created["requirements"] == ["Python", "Flask"]
    assert created["benefits"] == "Health plan and meal voucher"
    assert created["tempo"] == "published 24h ago"
    assert created["created_at"]

    detail = client.get(f"/jobs/{created['id']}")
    assert detail.status_code == 200
    assert detail.get_json()["job"]["company"] == "Example Inc."


def test_list_supports_filters_and_pagination(client):
    client.post("/jobs", json=job_payload())
    client.post("/jobs", json=job_payload(title="Data Analyst", company="Other Co.", salary=5000))

    response = client.get("/jobs?q=Python&company=Example&page=1&per_page=1")

    assert response.status_code == 200
    body = response.get_json()
    assert len(body["jobs"]) == 1
    assert body["jobs"][0]["company"] == "Example Inc."
    assert body["pagination"] == {"page": 1, "per_page": 1, "total": 1, "pages": 1}


def test_patch_put_and_delete_job(client):
    created = client.post("/jobs", json=job_payload()).get_json()["job"]
    job_id = created["id"]

    patched = client.patch(f"/jobs/{job_id}", json={"salary": 10000, "modality": "Hybrid"}).get_json()["job"]
    assert patched["salary"] == 10000
    assert patched["modality"] == "Hybrid"
    assert patched["title"] == "Backend Developer"

    replaced = client.put(f"/jobs/{job_id}", json=job_payload(title="Platform Engineer"))
    assert replaced.status_code == 200
    assert replaced.get_json()["job"]["title"] == "Platform Engineer"
    assert replaced.get_json()["job"]["category"] == "Engineering"

    deleted = client.delete(f"/jobs/{job_id}")
    assert deleted.status_code == 204
    assert client.get(f"/jobs/{job_id}").status_code == 404


def test_create_accepts_and_returns_english_fields(client):
    response = client.post(
        "/jobs",
        json=job_payload(
            title="Platform Engineer",
            modality="Hybrid",
            category="Platform",
            contract="PJ",
            level="Senior",
            requirements=["Kubernetes", "AWS"],
            benefits="Remote work stipend",
            tempo="published 2 days ago",
        ),
    )

    assert response.status_code == 201
    created = response.get_json()["job"]
    assert created["modality"] == "Hybrid"
    assert created["category"] == "Platform"
    assert created["contract"] == "PJ"
    assert created["level"] == "Senior"
    assert created["requirements"] == ["Kubernetes", "AWS"]
    assert created["benefits"] == "Remote work stipend"
    assert created["tempo"] == "published 2 days ago"


def test_validation_and_not_found_responses(client):
    invalid = client.post("/jobs", json={"title": "Only title"})
    assert invalid.status_code == 400
    assert "details" in invalid.get_json()

    negative_salary = client.post("/jobs", json=job_payload(salary=-1))
    assert negative_salary.status_code == 400

    empty_patch = client.patch(f"/jobs/{uuid.uuid4()}", json={})
    assert empty_patch.status_code == 400
    assert client.get(f"/jobs/{uuid.uuid4()}").status_code == 404


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok", "database": "ok"}


def test_invalid_list_parameters(client):
    assert client.get("/jobs?page=0").status_code == 400
    assert client.get("/jobs?per_page=101").status_code == 400
    assert client.get("/jobs?min_salary=20&max_salary=10").status_code == 400


@pytest.mark.parametrize(
    ("parameter", "expected_title"),
    [
        ("q=backend", "Backend Developer"),
        ("q=distributed", "Data Analyst"),
        ("company=example", "Backend Developer"),
        ("location=toronto", "Data Analyst"),
        ("min_salary=8000", "Backend Developer"),
        ("max_salary=6000", "Data Analyst"),
    ],
)
def test_list_filters(client, parameter, expected_title):
    client.post("/jobs", json=job_payload())
    client.post(
        "/jobs",
        json=job_payload(
            title="Data Analyst",
            description="Analyze distributed datasets",
            company="Other Co.",
            location="Toronto",
            salary=5000,
        ),
    )

    response = client.get(f"/jobs?{parameter}")

    assert response.status_code == 200
    assert [job["title"] for job in response.get_json()["jobs"]] == [expected_title]


def test_list_paginates_and_returns_empty_page(client):
    client.post("/jobs", json=job_payload(title="First"))
    client.post("/jobs", json=job_payload(title="Second"))
    client.post("/jobs", json=job_payload(title="Third"))

    first_page = client.get("/jobs?page=1&per_page=2").get_json()
    second_page = client.get("/jobs?page=2&per_page=2").get_json()
    empty_page = client.get("/jobs?page=5&per_page=2").get_json()

    assert len(first_page["jobs"]) == 2
    assert first_page["pagination"] == {"page": 1, "per_page": 2, "total": 3, "pages": 2}
    assert len(second_page["jobs"]) == 1
    assert empty_page["jobs"] == []
    assert empty_page["pagination"]["pages"] == 2


@pytest.mark.parametrize(
    "body",
    [
        None,
        [],
        {"title": "", "description": "desc", "company": "company", "location": "here"},
        {"title": "Title", "description": "desc", "company": "company", "location": "here", "extra": True},
        {"title": "Title", "description": "desc", "company": "company", "location": "here", "salary": "not-a-number"},
    ],
)
def test_create_rejects_invalid_payloads(client, body):
    if body is None:
        response = client.post("/jobs", data="not-json", content_type="application/json")
    else:
        response = client.post("/jobs", json=body)

    assert response.status_code == 400
    assert "error" in response.get_json()


@pytest.mark.parametrize(
    "changes",
    [
        {"url": "not-a-url"},
        {"url": "ftp://jobs.example.com/job"},
        {"platform": ""},
        {"platform": "x" * 101},
    ],
)
def test_create_rejects_invalid_url_or_platform(client, changes):
    response = client.post("/jobs", json=job_payload(**changes))

    assert response.status_code == 400
    assert "details" in response.get_json()


@pytest.mark.parametrize("field", ["url", "platform"])
def test_create_requires_url_and_platform(client, field):
    payload = job_payload()
    del payload[field]

    response = client.post("/jobs", json=payload)

    assert response.status_code == 400
    assert field in response.get_json()["details"]


def test_put_requires_all_required_fields(client):
    created = client.post("/jobs", json=job_payload()).get_json()["job"]

    response = client.put(f"/jobs/{created['id']}", json={"title": "Incomplete replacement"})

    assert response.status_code == 400
    assert "details" in response.get_json()


def test_same_company_cannot_create_duplicate_title(client):
    first = client.post("/jobs", json=job_payload())
    duplicate = client.post(
        "/jobs",
        json=job_payload(title="  backend developer ", company=" example inc. "),
    )

    assert first.status_code == 201
    assert duplicate.status_code == 409
    assert duplicate.get_json() == {"error": "Esta empresa já possui uma vaga com esse título."}


def test_same_title_is_allowed_for_another_company(client):
    assert client.post("/jobs", json=job_payload()).status_code == 201
    response = client.post("/jobs", json=job_payload(company="Different Company"))

    assert response.status_code == 201


def test_update_cannot_duplicate_another_job_at_same_company(client):
    client.post("/jobs", json=job_payload(title="Backend Developer"))
    other = client.post("/jobs", json=job_payload(title="Data Analyst")).get_json()["job"]

    response = client.patch(f"/jobs/{other['id']}", json={"title": "backend developer"})

    assert response.status_code == 409
    assert response.get_json() == {"error": "Esta empresa já possui uma vaga com esse título."}


def test_non_uuid_job_path_returns_json_404(client):
    response = client.get("/jobs/not-a-uuid")

    assert response.status_code == 404
    assert response.get_json() == {"error": "Recurso não encontrado."}


def test_list_database_error_returns_json_500(client, monkeypatch):
    def fail_list(**_kwargs):
        raise SQLAlchemyError("database unavailable")

    monkeypatch.setattr(jobs_ctr, "list_jobs", fail_list)

    response = client.get("/jobs")

    assert response.status_code == 500
    assert response.get_json() == {"error": "Não foi possível consultar as vagas."}


def test_default_admin_is_created_and_can_login(client):
    response = client.post("/auth/login", json={"username": "admin", "password": "admin"})

    assert response.status_code == 200
    body = response.get_json()["user"]
    assert body["username"] == "admin"
    assert body["role"] == "admin"


def test_user_registration_login_and_favorites(client):
    register = client.post("/auth/register", json={"username": "alice", "password": "secret123"})
    assert register.status_code == 201
    assert register.get_json()["user"]["username"] == "alice"
    assert register.get_json()["user"]["role"] == "user"

    login = client.post("/auth/login", json={"username": "alice", "password": "secret123"})
    assert login.status_code == 200
    assert login.get_json()["user"]["username"] == "alice"

    duplicate = client.post("/auth/register", json={"username": "alice", "password": "another"})
    assert duplicate.status_code == 409

    created_job = client.post("/jobs", json=job_payload(title="Favorite Role", company="Favorite Co.")).get_json()["job"]
    add_favorite = client.post("/auth/favorites", json={"username": "alice", "job_id": created_job["id"]})
    assert add_favorite.status_code == 200
    assert created_job["id"] in add_favorite.get_json()["user"]["favorite_jobs"]

    favorite_list = client.get("/auth/favorites", query_string={"username": "alice"})
    assert favorite_list.status_code == 200
    assert [job["id"] for job in favorite_list.get_json()["favorite_jobs"]] == [created_job["id"]]

    remove_favorite = client.delete("/auth/favorites", json={"username": "alice", "job_id": created_job["id"]})
    assert remove_favorite.status_code == 200
    assert remove_favorite.get_json()["user"]["favorite_jobs"] == []
