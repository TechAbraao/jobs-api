from flask import Blueprint

jobs_rts = Blueprint("jobs_rts", __name__, url_prefix="/jobs")


@jobs_rts.route("/", methods=["POST"])
def create_job():
    # Logic to create a new job
    pass

@jobs_rts.route("/", methods=["GET"])
def get_jobs():
    # Logic to retrieve jobs from the database or any other source
    jobs = [
        {"id": 1, "title": "Software Engineer", "company": "Tech Company"},
        {"id": 2, "title": "Data Scientist", "company": "Data Inc."},
    ]
    return {"jobs": jobs}, 200

@jobs_rts.route("/<int:job_id>", methods=["GET"])
def get_job(job_id):
    # Logic to retrieve a specific job by its ID from the database or any other source
    job = {"id": job_id, "title": "Software Engineer", "company": "Tech Company"}
    return {"job": job}, 200
