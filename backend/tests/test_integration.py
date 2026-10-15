"""Cross-service regression: consent reuse, revocation, and mock acceptance reconciliation."""

from fastapi.testclient import TestClient
from app.main import create_app

HEADERS = {"X-Demo-Token": "local-demo-token"}


def test_reuse_after_consent_and_revoke_preserves_receipt(tmp_path, monkeypatch):
    monkeypatch.setenv("LLM_MODE", "deterministic")
    client = TestClient(create_app(str(tmp_path / "integration.sqlite3")))

    def draft_approve(aid, save=False):
        draft = client.post(f"/applications/{aid}/resolve", headers=HEADERS, json={}).json()
        result = client.post(
            f"/applications/{aid}/approve",
            headers=HEADERS,
            json={
                "revision": draft["revision"],
                "answer": draft["draft"]["answer"],
                "consent_save": save,
                "confirm_sensitive": False,
            },
        )
        assert result.status_code == 200, result.text
        return result.json()

    draft_approve("a-rest", save=True)
    reused = draft_approve("a-reuse")
    submitted = client.post(
        "/applications/a-reuse/resume",
        headers=HEADERS,
        json={"revision": reused["revision"], "idempotency_key": "first"},
    ).json()
    assert submitted["receipt"]["submission_count"] == 1
    for answer in client.get("/answers", headers=HEADERS).json()["answers"]:
        assert client.delete(f"/answers/{answer['id']}", headers=HEADERS).status_code == 200
    assert client.get("/answers", headers=HEADERS).json()["answers"] == []
    retry = client.post(
        "/applications/a-reuse/resume",
        headers=HEADERS,
        json={"revision": 0, "idempotency_key": "a-different-key"},
    ).json()
    assert retry["receipt"] == submitted["receipt"]
