"""Public demo isolation, lifecycle, proxy-facing cookies, abuse and races."""

from concurrent.futures import ThreadPoolExecutor
import json
import sqlite3

import pytest
from fastapi.testclient import TestClient
from app.main import create_app
from session_helpers import establish, workspace_path, restart
from test_api import approved


@pytest.fixture
def pair(tmp_path, monkeypatch):
    monkeypatch.setenv("DEMO_MODE", "local")
    monkeypatch.setenv("LLM_MODE", "deterministic")
    app = create_app(str(tmp_path / "registry.sqlite3"))
    with TestClient(app) as a, TestClient(app) as b:
        yield establish(a), establish(b)


def test_complete_workspace_and_receipt_isolation(pair):
    a, b = pair
    approved(a, save=True)
    own = a.get("/answers").json()["answers"]
    saved = next(row for row in own if row["id"].startswith("answer-"))
    assert b.delete("/answers/" + saved["id"]).status_code == 404
    assert not any(row["id"] == saved["id"] for row in b.get("/answers").json()["answers"])
    assert b.get("/applications/a-rest/events").json()["events"] == []
    assert (
        b.post(
            "/applications/a-rest/resume", json={"revision": 0, "idempotency_key": "x"}
        ).status_code
        == 409
    )
    result = a.post(
        "/applications/a-rest/resume", json={"revision": 3, "idempotency_key": "x"}
    ).json()
    assert result["state"] == "submitted"
    other = approved(b)
    second = b.post(
        "/applications/a-rest/resume", json={"revision": other["revision"], "idempotency_key": "x"}
    ).json()
    assert result["receipt"]["receipt_id"] != second["receipt"]["receipt_id"]
    assert workspace_path(a) != workspace_path(b)


def test_concurrent_users_and_duplicate_retries(pair):
    a, b = pair
    with ThreadPoolExecutor(2) as pool:
        results = list(pool.map(approved, [a, b]))
    assert results[0]["state"] == results[1]["state"] == "approved"

    def submit(_):
        return a.post(
            "/applications/a-rest/resume", json={"revision": 3, "idempotency_key": "different"}
        ).json()

    with ThreadPoolExecutor(4) as pool:
        receipts = list(pool.map(submit, range(4)))
    assert len({row["receipt"]["receipt_id"] for row in receipts}) == 1
    assert b.get("/applications/a-rest/events").json()["events"][-1]["type"] == "approve"


def test_csrf_origin_cookie_and_no_legacy_authorization(pair):
    a, _ = pair
    for headers in (
        {"X-CSRF-Token": ""},
        {"X-CSRF-Token": "wrong"},
        {"Origin": "https://evil.example"},
        {"Origin": "null"},
    ):
        assert a.post("/applications/a-rest/resolve", json={}, headers=headers).status_code == 403
    assert a.post("/session", headers={"Origin": "https://evil.example"}).status_code == 403
    anonymous = TestClient(a.app)
    assert (
        anonymous.get("/applications", headers={"X-Demo-Token": "local-demo-token"}).status_code
        == 401
    )
    anonymous.cookies.set(a.app.state.sessions.cookie, "forged")
    assert anonymous.get("/applications").status_code == 401
    assert a.get("/applications", headers={"Sec-Fetch-Site": "cross-site"}).status_code == 403
    assert a.get("/applications").headers["cache-control"] == "no-store"


def test_reset_rotates_identity_and_only_deletes_own_workspace(pair):
    a, b = pair
    approved(a, save=True)
    approved(b)
    old = restart(a)
    path = workspace_path(a)
    assert a.post("/session/reset", json={}).status_code == 200
    assert old.get("/applications").status_code == 401
    from pathlib import Path

    assert not Path(path).exists()
    establish(a)
    assert a.get("/applications/a-rest/events").json()["events"] == []
    assert all(
        row["state"] == "interrupted" for row in a.get("/applications").json()["applications"]
    )
    assert b.get("/applications/a-rest/events").json()["events"][-1]["type"] == "approve"


def test_expiry_cleanup_capacity_and_limits(pair):
    a, b = pair
    from pathlib import Path

    path = workspace_path(a)
    sessions = a.app.state.sessions
    with sessions.connect() as db:
        name = Path(path).stem
        db.execute("UPDATE sessions SET expires=0 WHERE workspace=?", (name,))
    sessions.sweep_once()
    assert not Path(path).exists()
    assert a.get("/applications").status_code == 401
    sessions.max_sessions = 1
    assert a.post("/session", json={}).status_code == 503
    assert b.post("/applications/a-rest/resolve", content=b"x" * 16385).status_code == 413
    with sessions.connect() as db:
        db.execute("UPDATE sessions SET requests=180")
    assert b.get("/applications").status_code == 429


def test_mutation_throttle_and_bounded_history(pair):
    a, _ = pair
    sessions = a.app.state.sessions
    with sessions.connect() as db:
        db.execute("UPDATE sessions SET mutations=40")
    assert a.post("/applications/a-rest/resolve", json={}).status_code == 429
    with sessions.connect() as db:
        db.execute("UPDATE sessions SET mutations=0")
    with sqlite3.connect(workspace_path(a)) as db:
        db.executemany(
            "INSERT INTO events(application_id,type,from_state,to_state,detail) VALUES('a-rest','test','interrupted','interrupted','{}')",
            [()] * 200,
        )
    assert a.post("/applications/a-rest/resolve", json={}).status_code == 429
    assert a.post("/session/reset", json={}).status_code == 200


def test_public_cookie_flags_cors_and_configuration(tmp_path, monkeypatch):
    monkeypatch.setenv("DEMO_MODE", "public")
    monkeypatch.setenv("DEMO_ORIGINS", "https://demo.example")
    app = create_app(str(tmp_path / "public.sqlite3"))
    with TestClient(app, base_url="https://demo.example") as client:
        client.headers["Origin"] = "https://demo.example"
        response = client.post("/session", json={})
        cookie = response.headers["set-cookie"]
        for flag in (
            "__Host-bloom-session=",
            "HttpOnly",
            "Secure",
            "SameSite=strict",
            "Path=/",
            "Max-Age=",
        ):
            assert flag in cookie
        assert "Domain=" not in cookie
        assert client.get("/applications").status_code == 200
        assert (
            client.post(
                "/session/reset", json={}, headers={"X-CSRF-Token": response.json()["csrf_token"]}
            ).status_code
            == 200
        )
        assert (
            client.options(
                "/applications",
                headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
            ).status_code
            == 400
        )
    monkeypatch.setenv("LLM_MODE", "api")
    with pytest.raises(ValueError, match="deterministic"):
        create_app(str(tmp_path / "bad.sqlite3"))
    monkeypatch.setenv("LLM_MODE", "deterministic")
    monkeypatch.setenv("DEMO_ORIGINS", "*")
    with pytest.raises(ValueError, match="exact origins"):
        create_app(str(tmp_path / "wildcard.sqlite3"))


def test_global_throttle_and_sanitized_storage_error(pair, monkeypatch):
    a, _ = pair
    sessions = a.app.state.sessions
    with sessions.connect() as db:
        db.execute("UPDATE admission SET requests=1200")
    assert a.post("/session", json={}).status_code == 429
    with sessions.connect() as db:
        db.execute("UPDATE admission SET requests=0")

    def broken(*args):
        raise RuntimeError("private-path-secret")

    monkeypatch.setattr(sessions, "cleanup", broken)
    result = a.get("/applications")
    assert result.status_code == 503
    assert "private-path" not in result.text


def test_vercel_routing_contract():
    from pathlib import Path

    config = json.loads((Path(__file__).parents[2] / "frontend/vercel.json").read_text())
    assert config["rewrites"][0]["source"] == "/api/:path*"
    assert config["rewrites"][0]["destination"].endswith(".onrender.com/:path*")
    assert "api" in config["rewrites"][1]["source"]
    assert config["rewrites"][1]["destination"] == "/index.html"


def test_storage_loss_and_session_request_validation(pair):
    a, b = pair
    assert a.post("/session/reset", json={"document": "not accepted"}).status_code == 422
    assert a.post("/session", json=[]).status_code == 422
    assert a.post("/session", content="invalid").status_code == 422
    from pathlib import Path

    Path(workspace_path(a)).unlink()
    assert a.get("/applications").status_code == 401
    establish(a)
    assert all(
        row["state"] == "interrupted" for row in a.get("/applications").json()["applications"]
    )
    assert b.get("/applications").status_code == 200


def test_validation_does_not_echo_personal_input(pair):
    a, _ = pair
    result = a.post(
        "/applications/a-rest/approve", json={"revision": 0, "answer": "private" * 1000}
    )
    assert result.status_code == 422
    assert "private" not in result.text
