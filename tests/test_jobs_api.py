import pytest

from src import create_app
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
        "salary": 9000,
    }
    payload.update(overrides)
    return payload


def test_create_and_get_job(client):
    response = client.post("/jobs", json=job_payload())

    assert response.status_code == 201
    created = response.get_json()["job"]
    assert created["id"] > 0
    assert created["title"] == "Backend Developer"
    assert created["salary"] == 9000
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

    patched = client.patch(f"/jobs/{job_id}", json={"salary": 10000}).get_json()["job"]
    assert patched["salary"] == 10000
    assert patched["title"] == "Backend Developer"

    replaced = client.put(f"/jobs/{job_id}", json=job_payload(title="Platform Engineer"))
    assert replaced.status_code == 200
    assert replaced.get_json()["job"]["title"] == "Platform Engineer"

    deleted = client.delete(f"/jobs/{job_id}")
    assert deleted.status_code == 204
    assert client.get(f"/jobs/{job_id}").status_code == 404


def test_validation_and_not_found_responses(client):
    invalid = client.post("/jobs", json={"title": "Only title"})
    assert invalid.status_code == 400
    assert "details" in invalid.get_json()

    negative_salary = client.post("/jobs", json=job_payload(salary=-1))
    assert negative_salary.status_code == 400

    empty_patch = client.patch("/jobs/1", json={})
    assert empty_patch.status_code == 400
    assert client.get("/jobs/999").status_code == 404


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok", "database": "ok"}


def test_invalid_list_parameters(client):
    assert client.get("/jobs?page=0").status_code == 400
    assert client.get("/jobs?per_page=101").status_code == 400
    assert client.get("/jobs?min_salary=20&max_salary=10").status_code == 400
