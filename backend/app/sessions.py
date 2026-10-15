"""Bounded anonymous fictional workspaces. Registry transactions serialize requests.

Each session owns an entire SQLite database, including mock ATS uniqueness keys.
No request value is ever used as a filename. All expiry/reset/deletion happens
under the registry write lock, also held during workflow execution.
"""

import asyncio
from contextvars import ContextVar
from contextlib import asynccontextmanager, suppress
import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
import sqlite3
import time
from urllib.parse import urlparse

from fastapi import Request
from starlette.responses import JSONResponse

from .db import initialize
from .ats import MockATS

workspace: ContextVar[str] = ContextVar("workspace")
COOKIE = "__Host-bloom-session"
LOCAL_COOKIE = "bloom-local-session"


class RegistryConnection(sqlite3.Connection):
    def __exit__(self, *args):
        try:
            return super().__exit__(*args)
        finally:
            self.close()


class Sessions:
    def __init__(self, path: str):
        self.path = path
        self.directory = Path(path + ".workspaces")
        self.directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        if os.getenv("DEMO_MODE", "local") not in {"local", "public"}:
            raise ValueError("DEMO_MODE must be local or public")
        self.public = os.getenv("DEMO_MODE", "local") == "public"
        self.cookie = COOKIE if self.public else LOCAL_COOKIE
        self.origins = os.getenv(
            "DEMO_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173"
        ).split(",")
        if any(
            not origin
            or origin != origin.strip()
            or "*" in origin
            or urlparse(origin).scheme not in ({"https"} if self.public else {"http", "https"})
            or not urlparse(origin).netloc
            or urlparse(origin).path
            or urlparse(origin).query
            or urlparse(origin).fragment
            or urlparse(origin).username
            for origin in self.origins
        ):
            raise ValueError("DEMO_ORIGINS must contain exact origins; public mode requires HTTPS")
        if self.public and "DEMO_ORIGINS" not in os.environ:
            raise ValueError("Public mode requires explicit DEMO_ORIGINS")
        if self.public and os.getenv("LLM_MODE", "deterministic") != "deterministic":
            raise ValueError("Public demos require deterministic mode")
        if self.public and os.getenv("OPENAI_API_KEY"):
            raise ValueError("Public demos must not configure paid provider credentials")
        self.ttl = 3600
        self.max_sessions = 100
        with self.connect() as db:
            if db.execute("SELECT 1 FROM sqlite_master WHERE name='metadata'").fetchone():
                raise ValueError(
                    "Use a fresh DATABASE_PATH for the session registry; legacy databases are not migrated"
                )
            db.executescript("""
                CREATE TABLE IF NOT EXISTS sessions (
                    token_hash TEXT PRIMARY KEY, workspace TEXT UNIQUE NOT NULL,
                    csrf TEXT NOT NULL, expires REAL NOT NULL,
                    window INTEGER NOT NULL, requests INTEGER NOT NULL DEFAULT 0,
                    mutations INTEGER NOT NULL DEFAULT 0);
                CREATE TABLE IF NOT EXISTS admission (
                    id INTEGER PRIMARY KEY CHECK(id=1), window INTEGER NOT NULL,
                    requests INTEGER NOT NULL);
            """)

    @asynccontextmanager
    async def lifespan(self, app):
        async def sweep():
            while True:
                try:
                    await asyncio.to_thread(self.sweep_once)
                except sqlite3.OperationalError:
                    pass  # A busy registry is retried on the next minute/request.
                await asyncio.sleep(60)

        task = asyncio.create_task(sweep())
        try:
            yield
        finally:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task

    def sweep_once(self):
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            self.cleanup(db, time.time())

    def connect(self):
        return sqlite3.connect(
            self.path, timeout=5, check_same_thread=False, factory=RegistryConnection
        )

    def delete_workspace(self, name):
        # Names originate only from secrets.token_hex, never from the browser.
        for suffix in ("", "-journal", "-wal", "-shm"):
            (self.directory / (name + ".sqlite3" + suffix)).unlink(missing_ok=True)

    def cleanup(self, db, now):
        for (name,) in db.execute("SELECT workspace FROM sessions WHERE expires<=?", (now,)):
            self.delete_workspace(name)
        db.execute("DELETE FROM sessions WHERE expires<=?", (now,))
        # Recover files orphaned by a process crash during session creation/reset.
        live = {row[0] for row in db.execute("SELECT workspace FROM sessions")}
        for file in self.directory.glob("*.sqlite3"):
            if file.stem not in live:
                self.delete_workspace(file.stem)

    def seed(self):
        name = secrets.token_hex(24)
        path = str(self.directory / (name + ".sqlite3"))
        initialize(path)
        MockATS(path)
        return name, path

    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/health":
            return await call_next(request)
        if request.method == "OPTIONS":
            return await call_next(request)
        if request.headers.get("sec-fetch-site") == "cross-site":
            return self.error(403, "Cross-site requests are not allowed.")
        mutation = request.method not in {"GET", "HEAD"}
        if mutation and request.headers.get("origin") not in self.origins:
            return self.error(403, "An allowed Origin is required.")
        # Bound streamed bodies too, independent of Content-Length.
        body = bytearray()
        try:
            async with asyncio.timeout(5):
                async for chunk in request.stream():
                    if len(body) + len(chunk) > 16384:
                        return self.error(413, "Request is too large.")
                    body.extend(chunk)
        except TimeoutError:
            return self.error(408, "Request body timed out.")
        request._body = bytes(body)
        if request.url.path in {"/session", "/session/reset"} and mutation:
            try:
                if json.loads(body) != {}:
                    return self.error(422, "Session requests require an empty JSON object.")
            except (ValueError, UnicodeDecodeError):
                return self.error(422, "Session requests require an empty JSON object.")
        db = None
        context = None
        try:
            db = self.connect()
            await asyncio.to_thread(db.execute, "BEGIN IMMEDIATE")
            now = time.time()
            self.cleanup(db, now)
            window = int(now // 60)
            admission = db.execute("SELECT window,requests FROM admission WHERE id=1").fetchone()
            count = admission[1] + 1 if admission and admission[0] == window else 1
            db.execute("INSERT OR REPLACE INTO admission VALUES(1,?,?)", (window, count))
            if count > 1200:
                return self.error(429, "Demo capacity reached. Try again in a minute.")
            token = request.cookies.get(self.cookie, "")
            digest = hashlib.sha256(token.encode()).hexdigest()
            row = db.execute("SELECT * FROM sessions WHERE token_hash=?", (digest,)).fetchone()
            bootstrap = request.url.path == "/session" and request.method == "POST"
            if not row and not bootstrap:
                return self.error(401, "Demo session expired. Reload to start a fresh workspace.")
            if not row:
                if db.execute("SELECT count(*) FROM sessions").fetchone()[0] >= self.max_sessions:
                    return self.error(503, "Demo capacity reached. Try again later.")
                # Global admission prevents bypass by rotating cookies or forwarded IPs.
                token = secrets.token_urlsafe(32)
                digest = hashlib.sha256(token.encode()).hexdigest()
                name, _ = self.seed()
                db.execute(
                    "INSERT INTO sessions VALUES(?,?,?,?,?,0,0)",
                    (digest, name, secrets.token_urlsafe(32), now + self.ttl, window),
                )
                row = db.execute("SELECT * FROM sessions WHERE token_hash=?", (digest,)).fetchone()
            assert row is not None
            _, name, csrf, expires, previous_window, requests, mutations = row
            requests = requests + 1 if previous_window == window else 1
            mutations = mutations + int(mutation) if previous_window == window else int(mutation)
            db.execute(
                "UPDATE sessions SET window=?,requests=?,mutations=? WHERE token_hash=?",
                (window, requests, mutations, digest),
            )
            if requests > 180 or mutations > 40:
                return self.error(429, "Too many requests. Try again in a minute.")
            if (
                mutation
                and not bootstrap
                and not hmac.compare_digest(
                    request.headers.get("x-csrf-token", "").encode(), csrf.encode()
                )
            ):
                return self.error(403, "Invalid CSRF token. Reload the demo.")
            if bootstrap:
                response = JSONResponse({"csrf_token": csrf, "expires_at": expires})
                response.set_cookie(
                    self.cookie,
                    token,
                    max_age=max(0, int(expires - now)),
                    secure=self.public,
                    httponly=True,
                    samesite="strict",
                    path="/",
                )
                return response
            if request.url.path == "/session/reset" and request.method == "POST":
                # Rotate session identity. Existing in-flight requests cannot touch the new workspace.
                self.delete_workspace(name)
                db.execute("DELETE FROM sessions WHERE token_hash=?", (digest,))
                response = JSONResponse({"reset": True})
                response.delete_cookie(
                    self.cookie, path="/", secure=self.public, httponly=True, samesite="strict"
                )
                return response
            path = str(self.directory / (name + ".sqlite3"))
            if not Path(path).is_file():
                db.execute("DELETE FROM sessions WHERE token_hash=?", (digest,))
                return self.error(401, "Demo storage was reset. Reload for a fresh workspace.")
            context = workspace.set(path)
            response = await call_next(request)
            return response
        except sqlite3.OperationalError:
            return self.error(503, "Demo storage is busy. Retry shortly.")
        except Exception:
            # Never expose request bodies, session cookies, database paths or exceptions.
            return self.error(503, "Demo temporarily unavailable. Refresh current state.")
        finally:
            if context is not None:
                workspace.reset(context)
            if db is not None:
                try:
                    db.commit()
                finally:
                    db.close()

    @staticmethod
    def error(status, detail):
        return JSONResponse(
            {"detail": detail},
            status_code=status,
            headers={"Retry-After": "60"} if status == 429 else {},
        )
