"""Exercise the actual session handshake rather than a published bearer token."""

import hashlib

ORIGIN = "http://127.0.0.1:5173"


def establish(client):
    client.headers["Origin"] = ORIGIN
    response = client.post("/session", json={})
    assert response.status_code == 200, response.text
    client.headers["X-CSRF-Token"] = response.json()["csrf_token"]
    return client


def workspace_path(client):
    sessions = client.app.state.sessions
    token = client.cookies.get(sessions.cookie)
    with sessions.connect() as db:
        name = db.execute(
            "SELECT workspace FROM sessions WHERE token_hash=?",
            (hashlib.sha256(token.encode()).hexdigest(),),
        ).fetchone()[0]
    return str(sessions.directory / (name + ".sqlite3"))


def restart(client):
    from fastapi.testclient import TestClient
    from app.main import create_app

    new = TestClient(create_app(client.app.state.db_path))
    new.cookies.update(client.cookies)
    establish(new)
    return new
