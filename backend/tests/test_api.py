import sqlite3
import json
import pytest
from fastapi.testclient import TestClient
from app.main import create_app


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("LLM_MODE", "deterministic")
    with TestClient(create_app(str(tmp_path / "test.sqlite3"))) as client:
        client.headers["X-Demo-Token"] = "local-demo-token"
        yield client


def resolved(client, aid="a-rest"):
    response = client.post(f"/applications/{aid}/resolve", json={})
    assert response.status_code == 200, response.text
    return response.json()


def approved(client, aid="a-rest", save=False):
    app = resolved(client, aid)
    response = client.post(
        f"/applications/{aid}/approve",
        json={
            "revision": app["revision"],
            "answer": app["draft"]["answer"],
            "consent_save": save,
            "confirm_sensitive": False,
        },
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_token_and_candidate_boundary(client):
    assert client.get("/applications", headers={"X-Demo-Token": "wrong"}).status_code == 401
    assert len(client.get("/applications").json()["applications"]) == 5
    assert client.post("/applications/other/resolve", json={}).status_code == 404


def test_approval_required_and_stale_revision(client):
    assert (
        client.post(
            "/applications/a-rest/resume", json={"revision": 0, "idempotency_key": "x"}
        ).status_code
        == 409
    )
    app = resolved(client)
    assert (
        client.post(
            "/applications/a-rest/approve", json={"revision": 0, "answer": app["draft"]["answer"]}
        ).status_code
        == 409
    )
    assert (
        client.post(
            "/applications/a-rest/approve",
            json={
                "revision": app["revision"],
                "answer": "I managed AWS production infrastructure.",
            },
        ).status_code
        == 422
    )


def test_cloud_abstains_and_cannot_approve(client):
    app = resolved(client, "a-cloud")
    assert app["draft"]["answer"] == ""
    assert (
        client.post(
            "/applications/a-cloud/approve",
            json={"revision": app["revision"], "answer": "I deployed AWS services."},
        ).status_code
        == 422
    )


def test_sensitive_explicit_confirmation(client):
    app = resolved(client, "a-auth")
    body = {
        "revision": app["revision"],
        "answer": "I need sponsorship.",
        "confirm_sensitive": False,
    }
    assert client.post("/applications/a-auth/approve", json=body).status_code == 422
    body["confirm_sensitive"] = True
    assert client.post("/applications/a-auth/approve", json=body).status_code == 200


def test_timeout_reconciles_without_duplicate_after_restart(client):
    app = approved(client, "a-timeout")
    response = client.post(
        "/applications/a-timeout/resume",
        json={"revision": app["revision"], "idempotency_key": "first"},
    )
    assert response.json()["state"] == "verification_required"
    app = response.json()
    restarted = TestClient(create_app(client.app.state.db_path))
    restarted.headers["X-Demo-Token"] = "local-demo-token"
    response = restarted.post(
        "/applications/a-timeout/resume",
        json={"revision": app["revision"], "idempotency_key": "different"},
    )
    assert response.json()["state"] == "submitted"
    assert response.json()["receipt"]["submission_count"] == 1
    assert (
        restarted.post(
            "/applications/a-timeout/resume", json={"revision": 0, "idempotency_key": "third"}
        ).json()["receipt"]
        == response.json()["receipt"]
    )


def test_consent_revoke_and_history(client):
    baseline = len(client.get("/answers").json()["answers"])
    approved(client, save=True)
    answers = client.get("/answers").json()["answers"]
    assert len(answers) == baseline + 1
    saved = next(a for a in answers if a["id"].startswith("answer-"))
    assert client.delete("/answers/" + saved["id"]).status_code == 200
    assert len(client.get("/answers").json()["answers"]) == baseline
    history = client.get("/applications/a-rest/events").json()["events"]
    assert [e["type"] for e in history] == ["resolve_start", "resolve_success", "approve"]
    assert "answer" not in json.dumps([e["detail"] for e in history])


def test_provider_failure_safe_and_retry(client, monkeypatch):
    def broken(*args):
        raise RuntimeError("secret-provider-key")

    monkeypatch.setattr("app.ai.resolve_question", broken)
    response = client.post("/applications/a-rest/resolve", json={})
    assert response.status_code == 503
    assert "secret" not in response.text
    assert (
        next(a for a in client.get("/applications").json()["applications"] if a["id"] == "a-rest")[
            "state"
        ]
        == "failed"
    )


def test_external_candidate_evidence_never_returned(client):
    with sqlite3.connect(client.app.state.db_path) as db:
        db.execute(
            "INSERT INTO evidence VALUES(?,?,?)",
            (
                "foreign",
                "other",
                json.dumps({"id": "foreign", "candidate_id": "other", "text": "private"}),
            ),
        )
    assert "private" not in client.get("/applications").text
    assert "private" not in client.get("/answers").text


def test_revocation_survives_restart(client):
    assert client.delete("/answers/e-approved-rest").status_code == 200
    restarted = TestClient(create_app(client.app.state.db_path))
    restarted.headers["X-Demo-Token"] = "local-demo-token"
    assert restarted.get("/answers").json()["answers"] == []


def test_success_and_terminal_retry(client):
    app = approved(client)
    response = client.post(
        "/applications/a-rest/resume", json={"revision": app["revision"], "idempotency_key": "one"}
    )
    assert response.status_code == 200
    result = response.json()
    assert result["state"] == "submitted"
    again = client.post(
        "/applications/a-rest/resume", json={"revision": 0, "idempotency_key": "two"}
    )
    assert again.json()["receipt"] == result["receipt"]
    assert client.post("/applications/a-rest/resolve", json={}).status_code == 409
