"""Session-isolated fictional application recovery API."""

import hashlib
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.responses import JSONResponse
from . import ai
from .ats import AmbiguousSubmissionError, MockATS
from .db import CANDIDATE, connect, event, load
from .schemas import Application, ApprovalRequest, EmptyRequest, Resolution, ResumeRequest
from .workflow import is_sensitive, transition
from .sessions import Sessions, workspace

logger = logging.getLogger("bloom_rescue")


def create_app(db_path: str | None = None) -> FastAPI:
    path = str(db_path or os.getenv("DATABASE_PATH") or "data/sessions.sqlite3")
    sessions = Sessions(path)
    api = FastAPI(
        title="Bloom Rescue — fictional independent demo",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
        lifespan=sessions.lifespan,
    )
    api.state.db_path = path
    api.state.sessions = sessions
    api.add_middleware(
        CORSMiddleware,
        allow_origins=sessions.origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["Content-Type", "X-CSRF-Token"],
    )
    api.middleware("http")(sessions.dispatch)

    @api.middleware("http")
    async def security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        return response

    @api.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError):
        return JSONResponse(
            {"detail": "Invalid request. Check the required fields and limits."}, status_code=422
        )

    def required(db, aid: str) -> dict:
        app = load(db, aid)
        if app is None:
            raise HTTPException(404, "Application not found.")
        return app

    def revision(app: dict, expected: int):
        if app["revision"] != expected:
            raise HTTPException(409, "This application changed. Refresh and review it again.")

    def move(db, app: dict, action: str, detail: dict | None = None):
        try:
            target = transition(app["state"], action)
        except ValueError:
            raise HTTPException(409, "This action is not available in the current state.") from None
        event(db, app, action, target, detail)

    @api.get("/health")
    def health():
        return {"status": "ok", "mode": os.getenv("LLM_MODE", "deterministic")}

    @api.get("/applications")
    def applications():
        with connect(workspace.get()) as db:
            rows = db.execute(
                "SELECT id FROM applications WHERE candidate_id=? ORDER BY id", (CANDIDATE,)
            ).fetchall()
            return {
                "applications": [
                    Application.model_validate(required(db, row["id"])).model_dump() for row in rows
                ]
            }

    @api.post(
        "/applications/{aid}/resolve",
        response_model=Application,
    )
    def resolve(aid: str, body: EmptyRequest):
        with connect(workspace.get()) as db:
            db.execute("BEGIN IMMEDIATE")
            app = required(db, aid)
            if app["state"] == "resolving":
                last = db.execute(
                    "SELECT created_at FROM events WHERE application_id=? ORDER BY id DESC LIMIT 1",
                    (aid,),
                ).fetchone()
                age = 0.0
                if last:
                    started = datetime.fromisoformat(last["created_at"]).replace(
                        tzinfo=timezone.utc
                    )
                    age = (datetime.now(timezone.utc) - started).total_seconds()
                if age < 120:
                    raise HTTPException(
                        409,
                        "Draft is still resolving. Refresh, or retry after two minutes if it stopped.",
                    )
                move(db, app, "resolve_error", {"reason": "expired_resolution_lease"})
            if db.execute("SELECT count(*) FROM events").fetchone()[0] >= 200:
                raise HTTPException(429, "Workspace action limit reached. Reset the demo.")
            move(db, app, "resolve_start")
            pending_revision = app["revision"]
        # Deliberately do not hold a write transaction during model/network work.
        try:
            result = Resolution.model_validate(
                ai.resolve_question(app["question"], app["evidence"], app["question_kind"])
            ).model_dump()
        except Exception:
            logger.warning(json.dumps({"event": "resolution_failed", "application_id": aid}))
            with connect(workspace.get()) as db:
                db.execute("BEGIN IMMEDIATE")
                current = required(db, aid)
                if current["revision"] == pending_revision and current["state"] == "resolving":
                    move(db, current, "resolve_error")
            raise HTTPException(
                503, "Draft service unavailable. Your application is saved; retry resolution."
            ) from None
        with connect(workspace.get()) as db:
            db.execute("BEGIN IMMEDIATE")
            current = required(db, aid)
            revision(current, pending_revision)
            current["draft"] = result
            move(
                db,
                current,
                "resolve_success",
                {"mode": result["mode"], "verdict": result["verdict"]},
            )
            return current

    @api.post(
        "/applications/{aid}/approve",
        response_model=Application,
    )
    def approve(aid: str, body: ApprovalRequest):
        with connect(workspace.get()) as db:
            db.execute("BEGIN IMMEDIATE")
            app = required(db, aid)
            revision(app, body.revision)
            if app["state"] != "awaiting_review":
                raise HTTPException(409, "Resolve and review this application before approval.")
            answer = body.answer.strip()
            if not answer:
                raise HTTPException(422, "Enter an answer before approving.")
            # Classification comes from trusted server seeds, never request/model output.
            sensitive = is_sensitive(app["question_kind"])
            if sensitive:
                if not body.confirm_sensitive:
                    raise HTTPException(
                        422, "Explicit confirmation of your personal answer is required."
                    )
            else:
                if not app["draft"] or app["draft"]["verdict"] != "supported":
                    raise HTTPException(
                        422,
                        "This question still needs verified information before technical approval.",
                    )
                evidence = ai.retrieve_evidence(
                    app["question"], app["evidence"], app["question_kind"]
                )
                claims = [
                    {"text": e["text"], "source_id": e["id"], "quote": e["text"]}
                    for e in evidence
                    if e["text"] in answer
                ]
                claims = list({claim["text"]: claim for claim in claims}.values())
                valid, _ = ai.verify_answer(answer, claims, evidence)
                selected_evidence = [
                    e for e in evidence if e["id"] in {c["source_id"] for c in claims}
                ]
                coverage = ai.resolve_question(
                    app["question"], selected_evidence, app["question_kind"], mode="deterministic"
                )
                if not valid or coverage["verdict"] != "supported":
                    raise HTTPException(
                        422,
                        "Answer must contain only supported evidence statements. Unsupported technical claims cannot be approved.",
                    )
            app["approved_answer"] = answer
            if body.consent_save:
                saved = dict(
                    id=f"answer-{uuid.uuid4()}",
                    candidate_id=CANDIDATE,
                    kind="approved_answer",
                    topic=app["question_kind"]
                    if sensitive
                    else "rest"
                    if "rest" in app["question"].lower()
                    else "testing",
                    text=answer,
                    context=app["question"],
                )
                db.execute(
                    "INSERT INTO evidence VALUES(?,?,?)",
                    (saved["id"], CANDIDATE, json.dumps(saved)),
                )
            move(
                db,
                app,
                "approve",
                {"consent_save": body.consent_save, "human_confirmed": sensitive},
            )
            return app

    @api.post("/applications/{aid}/resume", response_model=Application)
    def resume(aid: str, body: ResumeRequest):
        with connect(workspace.get()) as db:
            db.execute("BEGIN IMMEDIATE")
            app = required(db, aid)
            # Terminal retry is read-only even if the client has an old revision.
            if app["state"] == "submitted":
                return app
            revision(app, body.revision)
            if app["state"] not in {"approved", "verification_required", "submitting"}:
                raise HTTPException(409, "Approve the reviewed answer before resuming.")
            answer = app["approved_answer"]
            logical_key = hashlib.sha256(f"{aid}:{answer}".encode()).hexdigest()
            reconciling = app["state"] in {"verification_required", "submitting"}
            if not reconciling:
                move(db, app, "submit_start")
            pending = app["revision"]
        # Adapter owns a separate SQLite connection: never nest write transactions.
        ats = MockATS(workspace.get())
        receipt = ats.status(aid, logical_key)
        ambiguous = False
        # This adapter is a local authoritative store: a negative lookup means
        # no acceptance exists. Its unique application constraint still guards
        # races. Real ATS adapters must not assume this status guarantee.
        if receipt is None:
            try:
                receipt = ats.submit(aid, answer, logical_key, app["scenario"])
            except AmbiguousSubmissionError:
                ambiguous = True
            except Exception:
                ambiguous = True
                logger.warning(json.dumps({"event": "submission_uncertain", "application_id": aid}))
        with connect(workspace.get()) as db:
            db.execute("BEGIN IMMEDIATE")
            current = required(db, aid)
            if current["state"] == "submitted":
                return current
            revision(current, pending)
            if receipt:
                current["receipt"] = receipt
                action = (
                    "reconcile_success"
                    if current["state"] == "verification_required"
                    else "submit_success"
                )
                move(db, current, action, {"mock": True})
            elif current["state"] == "submitting":
                move(db, current, "submit_timeout", {"ambiguous": ambiguous})
            else:
                move(db, current, "reconcile_pending", {"mock": True})
            return current

    @api.get("/applications/{aid}/events")
    def events(aid: str):
        with connect(workspace.get()) as db:
            required(db, aid)
            rows = db.execute(
                "SELECT * FROM events WHERE application_id=? ORDER BY id", (aid,)
            ).fetchall()
            return {"events": [{**dict(row), "detail": json.loads(row["detail"])} for row in rows]}

    @api.get("/answers")
    def answers():
        with connect(workspace.get()) as db:
            rows = db.execute(
                "SELECT data FROM evidence WHERE candidate_id=?", (CANDIDATE,)
            ).fetchall()
            return {
                "answers": [
                    data
                    for row in rows
                    if (data := json.loads(row["data"]))["kind"] == "approved_answer"
                ]
            }

    @api.delete("/answers/{answer_id}")
    def revoke(answer_id: str):
        with connect(workspace.get()) as db:
            row = db.execute(
                "SELECT data FROM evidence WHERE id=? AND candidate_id=?", (answer_id, CANDIDATE)
            ).fetchone()
            if row is None or json.loads(row["data"])["kind"] != "approved_answer":
                raise HTTPException(404, "Saved answer not found.")
            db.execute("DELETE FROM evidence WHERE id=? AND candidate_id=?", (answer_id, CANDIDATE))
            return {"revoked": True}

    return api


app = create_app()
