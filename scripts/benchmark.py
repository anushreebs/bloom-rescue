"""Reproducible local measurements; never connects to Bloom or a model provider."""

from __future__ import annotations
import argparse
import gzip
import json
import os
from pathlib import Path
import platform
import socket
import sqlite3
import statistics
import subprocess
import sys
import tempfile
import time
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


def summary(values):
    values = sorted(values)
    return {
        "samples": len(values),
        "median_ms": round(statistics.median(values), 3),
        "p95_ms": round(values[max(0, int(len(values) * 0.95 + 0.999) - 1)], 3),
        "min_ms": round(values[0], 3),
        "max_ms": round(values[-1], 3),
    }


def run(samples=30):
    sys.path.insert(0, str(ROOT / "backend"))
    from app.ai import resolve_question
    from app.seed import EVIDENCE

    with tempfile.TemporaryDirectory(prefix="bloom-benchmark-") as folder:
        database = str(Path(folder) / "benchmark.sqlite3")
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            port = sock.getsockname()[1]
        env = {
            **os.environ,
            "LLM_MODE": "deterministic",
            "DATABASE_PATH": database,
            "DEMO_API_TOKEN": "benchmark-local-only",
            "PYTHONPATH": str(ROOT / "backend"),
        }
        process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "app.main:app",
                "--host",
                "127.0.0.1",
                "--port",
                str(port),
                "--log-level",
                "error",
            ],
            cwd=ROOT / "backend",
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
        base = f"http://127.0.0.1:{port}"

        def request(path, body=None):
            req = Request(
                base + path,
                data=json.dumps(body).encode() if body is not None else None,
                headers={
                    "X-Demo-Token": "benchmark-local-only",
                    "Content-Type": "application/json",
                },
            )
            start = time.perf_counter()
            with urlopen(req, timeout=10) as response:
                data = response.read()
            return (time.perf_counter() - start) * 1000, json.loads(data), len(data)

        try:
            for _ in range(100):
                if process.poll() is not None:
                    raise RuntimeError(process.stderr.read().decode())
                try:
                    request("/health")
                    break
                except OSError:
                    time.sleep(0.05)
            else:
                raise RuntimeError("Temporary API did not become healthy")
            for _ in range(5):
                request("/applications")
            results = {}
            for name, path, body in [
                ("list", "/applications", None),
                ("events", "/applications/a-rest/events", None),
                ("resolve_deterministic", "/applications/a-rest/resolve", {}),
            ]:
                timings, sizes, reported = [], [], []
                for _ in range(samples):
                    elapsed, data, size = request(path, body)
                    timings.append(elapsed)
                    sizes.append(size)
                    if "draft" in data and data["draft"]:
                        reported.append(data["draft"]["latency_ms"])
                results[name] = {
                    **summary(timings),
                    "response_bytes_median": int(statistics.median(sizes)),
                }
                if reported:
                    results[name]["reported_draft_service"] = summary(reported)
            service = []
            for _ in range(samples * 10):
                start = time.perf_counter()
                resolve_question(
                    "Describe your REST API experience.", EVIDENCE, "technical", "deterministic"
                )
                service.append((time.perf_counter() - start) * 1000)
            results["direct_deterministic_service"] = summary(service)
            with sqlite3.connect(database) as db:
                statements = []
                db.row_factory = sqlite3.Row
                db.set_trace_callback(statements.append)
                from app.db import load

                ids = db.execute(
                    "SELECT id FROM applications WHERE candidate_id=? ORDER BY id", ("c-demo",)
                ).fetchall()
                for row in ids:
                    load(db, row["id"])
                query_info = {
                    "list_read_statements": len(statements),
                    "application_count": len(ids),
                    "note": "One ID query plus application and evidence query per application; tiny five-item seed only.",
                    "candidate_filter_plan": [
                        list(row)
                        for row in db.execute(
                            "EXPLAIN QUERY PLAN SELECT id FROM applications WHERE candidate_id=? ORDER BY id",
                            ("c-demo",),
                        )
                    ],
                }
            assets = []
            for file in sorted((ROOT / "frontend" / "dist").rglob("*")):
                if file.is_file():
                    raw = file.read_bytes()
                    assets.append(
                        {
                            "path": str(file.relative_to(ROOT)),
                            "bytes": len(raw),
                            "gzip_bytes": len(gzip.compress(raw, mtime=0)),
                        }
                    )
            return {
                "environment": {
                    "python": platform.python_version(),
                    "platform": platform.platform(),
                    "cpu": platform.processor(),
                    "date_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "transport": "loopback HTTP, fresh isolated SQLite, sequential warm requests, one uvicorn worker",
                    "warmup_list_requests": 5,
                },
                "timings": results,
                "database": query_info,
                "built_assets": assets,
                "live_llm": "NOT TESTED: script forces deterministic mode, no provider requests",
                "limits": [
                    "Not a production capacity or concurrency benchmark.",
                    "No browser main-thread or React profiler measurements collected by this script.",
                    "Gzip bytes are offline size estimates, not measured transfer.",
                ],
            }
        finally:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--samples", type=int, default=30)
    parser.add_argument("--output", type=Path, default=ROOT / "docs" / "performance-results.json")
    args = parser.parse_args()
    if args.samples < 2:
        parser.error("--samples must be at least 2")
    result = run(args.samples)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))
