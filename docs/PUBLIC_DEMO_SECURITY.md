# Session-isolated fictional public demo review

Scope: source review and automated local verification of this branch's anonymous demo.
No real ATS, live model, hosted Vercel/Render environment, penetration test or production
candidate system is claimed. See [DEPLOYMENT.md](../DEPLOYMENT.md) for settings and
hosted release gates. Existing security/architecture reports are historical local-demo evidence.

## Security boundary and SQL audit

The session registry stores SHA-256 hashes of 256-bit random cookie tokens, independent
random CSRF values, random internal workspace names, absolute expiry and minute counters.
Cookie values are never used as filenames or SQL fragments. A context variable selects the
server-owned workspace for every route; the browser cannot select another database.

| SQL owner | Tables/queries | Isolation and uniqueness |
| --- | --- | --- |
| `sessions.py` | Session lookup/creation, counters, admission, expiry/reset | Parameterized hash lookup; registry contains no answers. Random workspace names are UNIQUE, token hashes PRIMARY KEY. Registry write transaction serializes complete requests and filesystem cleanup. |
| `db.py` | Seed, applications, evidence, metadata, events, load/store | Each database belongs to one session. Existing candidate predicates remain defense in depth. Application/evidence IDs are primary keys inside that workspace. Values use bound parameters. No endpoint exposes the registry as a workspace. |
| `main.py` | Lists, draft lease lookup, saved evidence/revocation, audit history | Every connection uses the request's context-selected workspace. Application lookup precedes audit access. Candidate filters protect evidence and revocation. Event/application IDs cannot cross a workspace boundary. |
| `ats.py` | Receipt lookup, insertion, status | Adapter is constructed with the same context-selected workspace. `application_id PRIMARY KEY` means one acceptance per application **within that session**; `receipt_id UNIQUE` remains workspace-local. BEGIN IMMEDIATE protects concurrent acceptance. No shared/global receipt table exists. |

No user-controlled SQL identifiers are interpolated. Schema DDL and static selects are
constant strings. The few f-strings build server-generated receipt/logical IDs or safe
filesystem paths, never executable SQL. Existing databases with legacy metadata are
refused as session registries; no implicit data migration occurs.

Each workflow retains stale-revision rejection, deterministic evidence validation,
explicit approval, sensitive confirmation, opt-in reuse and revocation. A durable receipt
is committed before simulated timeout; status reconciliation consults the same session's
mock store. Different client retry keys cannot create another acceptance. Restart tests
retain the session cookie and registry path; fixtures no longer use a public shared token.

## Request controls and lifecycle

Public mode fails startup unless origins are explicit HTTPS origins, the LLM is
deterministic and no paid-model key exists. There are no model calls in this mode.
Mutations require a valid cookie, matching CSRF value and exact Origin. Bootstrap is the
only CSRF-token exception: it requires the allowed Origin before issuing or resuming a
session, and it cannot modify an existing workspace. Foreign cross-site fetch metadata
is denied. Cookies are host-only, Secure, HttpOnly, SameSite=Strict, Path=/, and expire
absolutely after one hour. Local mode uses a separate cookie name without Secure for
loopback HTTP. No secrets are bundled in frontend assets.

Reset deletes the session's whole workspace (including saved answers, history, receipts
and approved sensitive answers), removes registry authorization and expires its cookie.
New bootstrap uses a new cookie and workspace; old requests/cookies cannot attach to it.
Other sessions are untouched. Unlike reuse revocation, reset also deletes application
history. Background/request cleanup removes expired workspaces; a stopped service only
cleans up after restart. Limits and filesystem persistence caveats are in DEPLOYMENT.md.

Request bodies are bounded even without Content-Length and have a read deadline. Pydantic
rejects unknown fields, oversized answers and invalid revisions. Validation errors omit
raw input. Storage/provider failures return generic messages. App logs include safe event
codes and seeded application IDs, never answers, cookies, provider payloads or CSRF values.
The documented start command disables Uvicorn access logs to avoid logging arbitrary query
strings; hosting-provider edge logs are governed by the provider, not this app.

## Limits of this review

This is anonymous visitor isolation, not verified human identity, production multi-tenancy,
or a system for real candidate records. Users must supply fictional answers only; text
entry cannot prove the input is fictional. No file ingestion endpoint exists. Copied/stolen
session cookies give access until expiry/reset; CSP, HttpOnly, Secure and no-store reduce
exposure but do not establish immunity to XSS or a compromised browser/hosting account.

Session and global rate limits cap work without trusting forwarded IP headers. An attacker
can still occupy all 100 anonymous sessions; the system refuses more rather than growing
unbounded. Public availability under attack needs platform-level controls and a separate
capacity assessment. The registry intentionally serializes work and is not a scalable
production database. SQLite restart guarantees require persistent storage and both filesets;
Render Free cannot provide that guarantee. No paid resource has been provisioned.

The local HTTPS proxy exercises real browser cookies and a real backend, but is a test
harness, not Vercel. Actual forwarding/cache behavior and hosted checks remain mandatory
before publication. See the validation results recorded in the final task summary.

## Local validation evidence (15 October 2026)

Runtime: Python 3.12.10, Node v24.21.0. Browser tests used installed Google Chrome via
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; the default Playwright browser revision was not
installed. Local-server binding required sandbox approval. Separate output directories
prevent the HTTPS suite from deleting another suite's trace files.

| Command/check | Final result |
| --- | --- |
| `.venv/bin/python -m pytest -q backend/tests` | **92 passed**; one upstream Starlette/httpx TestClient deprecation warning |
| `ruff check` / `ruff format --check` for backend, eval, scripts | Passed |
| `mypy --config-file backend/pyproject.toml backend/app` | Passed, 9 source files |
| `python eval/run_eval.py` | **35/35** deterministic cases and **8/8** verifier cases passed; generated timing changes excluded from this implementation |
| `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build` | All passed |
| `npm test` | **10 passed** |
| `npm run e2e -- recovery.spec.ts` | **3 passed**, all five scenarios plus accessibility/mobile and network recovery |
| `npm run e2e -- v3-workflows.spec.ts --grep fixture --output /tmp/bloom-session-fixture-results` | **11 passed**, existing edit retention, consent, stale updates and navigation regressions |
| `npx playwright test --config playwright.public.config.ts` | **1 passed**, real public-mode HTTPS proxy flow |
| `git diff --check`; client source/build scan for old token and provider-key references | Passed; no matches in `frontend/src` or `frontend/dist` |

The original **81 backend tests remain**, updated to bootstrap session cookies and carry
them across restarts rather than authorize with a public header. Direct DB fixtures now
use the server-selected workspace, preserving the original recovery and foreign-record
checks. Eleven additional backend tests cover public-demo boundaries. Browser fixtures
now explicitly return a session handshake. No remote CI run or hosted test is claimed;
only the selected 15 browser tests above were executed for this change.
