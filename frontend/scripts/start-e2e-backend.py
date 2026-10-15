"""Run a fresh fictional E2E backend; never touch the regular demo database."""

import os
import sys
import tempfile
from pathlib import Path

import uvicorn

# Each process receives a brand-new absolute database, avoiding stale state on
# repeated runs. Never delete or reuse the normal demonstration database.
os.environ["LLM_MODE"] = "deterministic"
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))
with tempfile.TemporaryDirectory(prefix="bloom-rescue-e2e-") as directory:
    os.environ["DATABASE_PATH"] = str(Path(directory) / "test.sqlite3")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)
