"""Lead integration regressions for process interruption recovery."""

from session_helpers import establish, workspace_path
import json
import sqlite3

from fastapi.testclient import TestClient
from app.main import create_app


def test_expired_resolution_can_retry_but_active_resolution_cannot(tmp_path, monkeypatch):
    monkeypatch.setenv("LLM_MODE", "deterministic")
    path = str(tmp_path / "recovery.sqlite3")
    app = create_app(path)
    seed_client = establish(TestClient(app))
    cookies = seed_client.cookies
    with sqlite3.connect(workspace_path(seed_client)) as db:
        row = db.execute("SELECT data FROM applications WHERE id='a-rest'").fetchone()
        data = json.loads(row[0])
        data.update(state="resolving", revision=1)
        db.execute("UPDATE applications SET data=? WHERE id='a-rest'", (json.dumps(data),))
        db.execute(
            "INSERT INTO events(application_id,type,from_state,to_state,detail) VALUES('a-rest','resolve_start','interrupted','resolving','{}')"
        )
    with TestClient(app) as client:
        client.cookies.update(cookies)
        establish(client)
        cookies = client.cookies
        session_path = workspace_path(client)
        assert client.post("/applications/a-rest/resolve", json={}).status_code == 409
        with sqlite3.connect(session_path) as db:
            db.execute("UPDATE events SET created_at='2000-01-01 00:00:00'")
        result = client.post("/applications/a-rest/resolve", json={})
        assert result.status_code == 200
        assert result.json()["state"] == "awaiting_review"
        events = client.get("/applications/a-rest/events").json()["events"]
        assert events[1]["detail"]["reason"] == "expired_resolution_lease"


def test_submitting_after_restart_reconciles_receipt(tmp_path, monkeypatch):
    monkeypatch.setenv("LLM_MODE", "deterministic")
    path = str(tmp_path / "restart.sqlite3")
    cookies = {}
    with TestClient(create_app(path)) as client:
        client.cookies.update(cookies)
        establish(client)
        cookies = client.cookies
        session_path = workspace_path(client)
        draft = client.post("/applications/a-timeout/resolve", json={}).json()
        approved = client.post(
            "/applications/a-timeout/approve",
            json={"revision": draft["revision"], "answer": draft["draft"]["answer"]},
        ).json()
        client.post(
            "/applications/a-timeout/resume",
            json={"revision": approved["revision"], "idempotency_key": "first"},
        )
    with sqlite3.connect(session_path) as db:
        data = json.loads(
            db.execute("SELECT data FROM applications WHERE id='a-timeout'").fetchone()[0]
        )
        data["state"] = "submitting"
        db.execute("UPDATE applications SET data=? WHERE id='a-timeout'", (json.dumps(data),))
    with TestClient(create_app(path)) as client:
        client.cookies.update(cookies)
        establish(client)
        cookies = client.cookies
        session_path = workspace_path(client)
        result = client.post(
            "/applications/a-timeout/resume",
            json={"revision": data["revision"], "idempotency_key": "retry"},
        ).json()
        assert result["state"] == "submitted"
        assert result["receipt"]["submission_count"] == 1


def test_restart_before_adapter_acceptance_recovers_safely(tmp_path, monkeypatch):
    monkeypatch.setenv("LLM_MODE", "deterministic")
    path = str(tmp_path / "before-accept.sqlite3")
    cookies = {}
    with TestClient(create_app(path)) as client:
        client.cookies.update(cookies)
        establish(client)
        cookies = client.cookies
        session_path = workspace_path(client)
        draft = client.post("/applications/a-rest/resolve", json={}).json()
        approved = client.post(
            "/applications/a-rest/approve",
            json={"revision": draft["revision"], "answer": draft["draft"]["answer"]},
        ).json()
    with sqlite3.connect(session_path) as db:
        data = json.loads(
            db.execute("SELECT data FROM applications WHERE id='a-rest'").fetchone()[0]
        )
        data.update(state="submitting", revision=approved["revision"] + 1)
        db.execute("UPDATE applications SET data=? WHERE id='a-rest'", (json.dumps(data),))
    with TestClient(create_app(path)) as client:
        client.cookies.update(cookies)
        establish(client)
        cookies = client.cookies
        session_path = workspace_path(client)
        result = client.post(
            "/applications/a-rest/resume",
            json={"revision": data["revision"], "idempotency_key": "restarted"},
        ).json()
        assert result["state"] == "submitted"
        assert result["receipt"]["submission_count"] == 1
