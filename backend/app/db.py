"""Small SQLite repository with explicit atomic mutations."""

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from .seed import APPLICATIONS, EVIDENCE

CANDIDATE = "c-demo"


@contextmanager
def connect(path: str):
    connection = sqlite3.connect(path, timeout=10)
    connection.execute("PRAGMA max_page_count=256")
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize(path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with connect(path) as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS applications(id TEXT PRIMARY KEY,candidate_id TEXT NOT NULL,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS evidence(id TEXT PRIMARY KEY,candidate_id TEXT NOT NULL,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT,application_id TEXT NOT NULL,type TEXT NOT NULL,from_state TEXT NOT NULL,to_state TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,detail TEXT NOT NULL);
        """)
        if db.execute("SELECT 1 FROM metadata WHERE key='seeded'").fetchone():
            return
        db.execute("INSERT INTO metadata VALUES('seeded','1')")
        for evidence in EVIDENCE:
            db.execute(
                "INSERT OR IGNORE INTO evidence VALUES(?,?,?)",
                (evidence["id"], CANDIDATE, json.dumps(evidence)),
            )
        for aid, company, role, question, kind, scenario in APPLICATIONS:
            data = dict(
                id=aid,
                candidate_id=CANDIDATE,
                company=company,
                role=role,
                question=question,
                question_kind=kind,
                state="interrupted",
                revision=0,
                draft=None,
                approved_answer=None,
                receipt=None,
                scenario=scenario,
            )
            db.execute(
                "INSERT OR IGNORE INTO applications VALUES(?,?,?)",
                (aid, CANDIDATE, json.dumps(data)),
            )


def evidence_for(db, application_id: str) -> list[dict]:
    rows = db.execute(
        "SELECT data FROM evidence WHERE candidate_id=? ORDER BY id", (CANDIDATE,)
    ).fetchall()
    evidence = [json.loads(row["data"]) for row in rows]
    # Prior approved answer is supplied only in the explicitly consented reuse scenario.
    return [e for e in evidence if application_id == "a-reuse" or e["id"] != "e-approved-rest"]


def load(db, application_id: str) -> dict | None:
    row = db.execute(
        "SELECT data FROM applications WHERE id=? AND candidate_id=?", (application_id, CANDIDATE)
    ).fetchone()
    if row is None:
        return None
    data = json.loads(row["data"])
    data["evidence"] = evidence_for(db, application_id)
    return data


def store(db, data: dict) -> None:
    saved = {key: value for key, value in data.items() if key != "evidence"}
    db.execute(
        "UPDATE applications SET data=? WHERE id=? AND candidate_id=?",
        (json.dumps(saved), data["id"], CANDIDATE),
    )


def event(db, app: dict, event_type: str, target: str, detail: dict | None = None) -> None:
    db.execute(
        "INSERT INTO events(application_id,type,from_state,to_state,detail) VALUES(?,?,?,?,?)",
        (app["id"], event_type, app["state"], target, json.dumps(detail or {})),
    )
    app["state"] = target
    app["revision"] += 1
    store(db, app)
