"""Persistent, fictional ATS adapter. No network requests or real employers.

Acceptance is committed before an ambiguous timeout is raised. Consumers must
query ``status`` to reconcile, never assume that a timeout means rejection.
"""

import hashlib
import sqlite3
import uuid
from collections.abc import Iterator
from contextlib import contextmanager


class AmbiguousSubmissionError(RuntimeError):
    """Acceptance may have occurred; consult the adapter's status endpoint."""


class MockATS:
    """One durable acceptance per application, regardless of client retry keys."""

    def __init__(self, db_path: str):
        self.db_path = db_path
        with self._connect() as connection:
            connection.execute(
                """CREATE TABLE IF NOT EXISTS mock_ats_receipts (
                    application_id TEXT PRIMARY KEY,
                    logical_key TEXT NOT NULL,
                    answer_hash TEXT NOT NULL,
                    receipt_id TEXT NOT NULL UNIQUE,
                    accepted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )"""
            )

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.db_path, timeout=5)
        connection.execute("PRAGMA max_page_count=256")
        connection.row_factory = sqlite3.Row
        try:
            with connection:
                yield connection
        finally:
            connection.close()

    @staticmethod
    def _receipt(row: sqlite3.Row) -> dict[str, str | int]:
        return {
            "receipt_id": str(row["receipt_id"]),
            "application_id": str(row["application_id"]),
            "status": "submitted",
            "submission_count": 1,
        }

    def submit(
        self,
        application_id: str,
        answer: str,
        logical_key: str,
        scenario: str = "normal",
    ) -> dict[str, str | int]:
        if not application_id.strip() or not answer.strip() or not logical_key.strip():
            raise ValueError("Application, answer, and logical key are required")
        if scenario not in {"normal", "ambiguous_timeout"}:
            raise ValueError("Unknown mock ATS scenario")
        answer_hash = hashlib.sha256(answer.encode("utf-8")).hexdigest()
        newly_accepted = False
        with self._connect() as connection:
            # Serialize lookup and acceptance across threads/processes.
            connection.execute("BEGIN IMMEDIATE")
            row = connection.execute(
                "SELECT * FROM mock_ats_receipts WHERE application_id = ?",
                (application_id,),
            ).fetchone()
            if row is None:
                connection.execute(
                    """INSERT INTO mock_ats_receipts
                    (application_id, logical_key, answer_hash, receipt_id)
                    VALUES (?, ?, ?, ?)""",
                    (application_id, logical_key, answer_hash, f"mock-{uuid.uuid4()}"),
                )
                row = connection.execute(
                    "SELECT * FROM mock_ats_receipts WHERE application_id = ?",
                    (application_id,),
                ).fetchone()
                newly_accepted = True
            elif row["answer_hash"] != answer_hash:
                raise ValueError("Application already accepted with a different answer")
            assert row is not None
            receipt = self._receipt(row)
        # Transaction has committed, including when the response is lost.
        if newly_accepted and scenario == "ambiguous_timeout":
            raise AmbiguousSubmissionError("Mock acceptance requires status verification")
        return receipt

    def status(self, application_id: str, logical_key: str) -> dict[str, str | int] | None:
        if not application_id.strip() or not logical_key.strip():
            raise ValueError("Application and logical key are required")
        with self._connect() as connection:
            row = connection.execute(
                "SELECT * FROM mock_ats_receipts WHERE application_id = ?",
                (application_id,),
            ).fetchone()
        # Application identity is authoritative. A changed retry key must not
        # conceal an already accepted submission and induce a duplicate.
        return self._receipt(row) if row is not None else None
