"""Adversarial local-demo boundaries; no external targets or credentials."""

import json
import sqlite3

import pytest
from fastapi.testclient import TestClient
from app.main import create_app


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("LLM_MODE", "deterministic")
    monkeypatch.setenv("DEMO_API_TOKEN", "local-demo-token")
    with TestClient(create_app(str(tmp_path / "security.sqlite3"))) as instance:
        instance.headers["X-Demo-Token"] = "local-demo-token"
        yield instance


@pytest.mark.parametrize(
    "method,path,body",
    [
        ("get", "/applications", None),
        ("get", "/answers", None),
        ("get", "/applications/a-rest/events", None),
        ("post", "/applications/a-rest/resolve", {}),
        ("post", "/applications/a-rest/approve", {"revision": 0, "answer": "x"}),
        ("post", "/applications/a-rest/resume", {"revision": 0, "idempotency_key": "x"}),
        ("delete", "/answers/e-approved-rest", None),
    ],
)
def test_every_data_route_requires_token(client, method, path, body):
    for headers in ({}, {"X-Demo-Token": "wrong"}):
        with TestClient(client.app) as anonymous:
            response = anonymous.request(method, path, json=body, headers=headers)
        assert response.status_code == 401


def test_foreign_application_and_answer_cannot_be_accessed(client):
    with sqlite3.connect(client.app.state.db_path) as db:
        own = json.loads(
            db.execute("SELECT data FROM applications WHERE id='a-rest'").fetchone()[0]
        )
        own.update(id="foreign-app", candidate_id="other")
        db.execute(
            "INSERT INTO applications VALUES(?,?,?)", ("foreign-app", "other", json.dumps(own))
        )
        db.execute(
            "INSERT INTO evidence VALUES(?,?,?)",
            (
                "foreign-answer",
                "other",
                json.dumps({"kind": "approved_answer", "text": "PRIVATE-SECRET"}),
            ),
        )
    assert "foreign-app" not in client.get("/applications").text
    assert "PRIVATE-SECRET" not in client.get("/answers").text
    assert client.get("/applications/foreign-app/events").status_code == 404
    assert client.post("/applications/foreign-app/resolve", json={}).status_code == 404
    assert client.delete("/answers/foreign-answer").status_code == 404


def test_client_cannot_supply_identity_or_state(client):
    response = client.post(
        "/applications/a-rest/resolve", json={"candidate_id": "other", "state": "approved"}
    )
    assert response.status_code == 422


def test_fabricated_suffix_rejected_and_no_consent_no_storage(client):
    baseline = client.get("/answers").json()
    app = client.post("/applications/a-rest/resolve", json={}).json()
    body = {
        "revision": app["revision"],
        "answer": app["draft"]["answer"] + " I also led a production AWS migration.",
    }
    assert client.post("/applications/a-rest/approve", json=body).status_code == 422
    body["answer"] = app["draft"]["answer"]
    assert client.post("/applications/a-rest/approve", json=body).status_code == 200
    assert client.get("/answers").json() == baseline


def test_sensitive_content_not_in_event_detail(client):
    app = client.post("/applications/a-auth/resolve", json={}).json()
    body = {"revision": app["revision"], "answer": "SENSITIVE-MANUAL-ANSWER", "consent_save": False}
    assert client.post("/applications/a-auth/approve", json=body).status_code == 422
    body["confirm_sensitive"] = True
    assert client.post("/applications/a-auth/approve", json=body).status_code == 200
    assert "SENSITIVE-MANUAL-ANSWER" not in client.get("/applications/a-auth/events").text
    assert "SENSITIVE-MANUAL-ANSWER" not in client.get("/answers").text


def test_provider_error_redacted_from_response_and_logs(client, monkeypatch, caplog):
    def malicious_provider(*args):
        raise RuntimeError("private-provider-token-DO-NOT-LOG")

    monkeypatch.setattr("app.ai.resolve_question", malicious_provider)
    response = client.post("/applications/a-rest/resolve", json={})
    assert response.status_code == 503
    assert "private-provider-token" not in response.text + caplog.text


def test_cors_disallows_unconfigured_origin(client):
    response = client.options(
        "/applications",
        headers={
            "Origin": "https://attacker.example",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "X-Demo-Token",
        },
    )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
