# Local API

This is an independent fictional demo, not a Bloom or employer integration. Run from `backend` using `uvicorn app.main:app --host 127.0.0.1 --port 8000`. OpenAPI documentation is at `/docs`. `create_app(db_path)` constructs an isolated test instance. `DATABASE_PATH` defaults to `data/bloom-rescue.sqlite3`.

All data routes require a server-issued HttpOnly demo session cookie. `POST /session` bootstraps a fictional workspace with an exact allowed Origin and returns `csrf_token`. Subsequent mutations require that Origin and `X-CSRF-Token`. `POST /session/reset` deletes only the current workspace and invalidates its cookie; bootstrap again for fresh seeds. Sessions expire after one hour. `/health` is public. Local mode permits loopback HTTP; public mode requires Secure cookies and exact HTTPS `DEMO_ORIGINS`. See [deployment settings and limits](../DEPLOYMENT.md). Candidate `c-demo` is fixed inside each private session database, never shared across visitors.

| Method and route | Behavior |
|---|---|
| GET `/health` | Status and configured deterministic/API mode. Does not prove provider availability. |
| GET `/applications` | Five fictional applications with current evidence, revisions and state. |
| POST `/applications/{id}/resolve` | Body `{}`. Records resolving then validated draft/awaiting_review. Provider error returns sanitized 503 and persistent failed state. |
| POST `/applications/{id}/approve` | Body `{revision, answer, consent_save, confirm_sensitive}`. Explicit review required; stale revision 409; unsupported technical content 422. Personal authorization answers require human confirmation. |
| POST `/applications/{id}/resume` | Body `{revision, idempotency_key}`. Requires approved answer. Uses stable server-side logical identity, not arbitrary retry key, for mock submission. |
| GET `/applications/{id}/events` | State events with timestamps and metadata; excludes raw answers. |
| GET `/answers` | Consent-saved fictional answers, including one seeded approved REST answer. |
| DELETE `/answers/{id}` | Revoke a saved answer. Does not undo an already approved response or accepted mock submission. Revocation survives restart. |

Pydantic forbids extra request fields. Answers are limited to 5,000 characters; retry keys to 200. Errors use FastAPI's `detail` shape (validation errors contain structured lists). Unknown application IDs return 404.

## Consistency and failure semantics

SQLite `BEGIN IMMEDIATE` serializes local mutations. The resolve endpoint commits its pending revision before calling the AI service and discards late responses through optimistic revision checks. No SQLite write transaction is held across provider calls. Approval stores the accepted answer and optional consent in one transaction.

Mock ATS acceptance is durable before simulated timeout. A timeout returns `verification_required`; the next resume reconciles durable status. Repeated requests, changed client keys, and process restarts cannot duplicate acceptance. Terminal submitted retries return the existing receipt. A receipt is mock-only and does not establish a real employer received anything.

Technical approval is deliberately extractive and conservative: current context-filtered evidence must support every complete statement. Cloud experience has no source and remains unapprovable in this MVP. Missing evidence does not imply the fictional candidate lacks experience. Sensitive answers originate from explicitly confirmed human input rather than inference.

## Known limits

- A process killed during `resolving` can be retried after a two-minute lease through the same resolve endpoint; active work returns409. Revisions discard late results. Persisted `submitting` states can check authoritative mock status and safely recover both before and after acceptance; this guarantee must not be generalized to a real ATS.
- A submission with no reconcilable receipt stays verification-required; it is never blindly replayed. Operator recovery beyond reconciliation is deferred.
- Anonymous session authorization is included; real candidate accounts, uploads, ATS, telemetry backend and a performed production deployment are not included.
- API-mode operation requires explicit configuration and a live test; deterministic tests do not establish live model behavior.
- Saved answers currently require context-compatible retrieval, not semantic paraphrase. Editing beyond verbatim evidence is rejected rather than assessed by an unvalidated semantic judge.
