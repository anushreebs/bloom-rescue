# Fictional public demo: Vercel + Render

This repository supports an anonymous, fully interactive **fictional** recovery demo.
There are no real employer/ATS calls, document uploads, or candidate accounts.
Do not enter personal information. Public mode is deterministic and refuses API mode
or an OpenAI key at startup. The original reports describe the earlier local prototype;
this document and `docs/PUBLIC_DEMO_SECURITY.md` describe the session-based revision.

## Release status

Code and local checks can be prepared without hosting. Hosting is **not yet verified**.
Before publishing, replace the Render destination placeholder in `frontend/vercel.json`,
set the exact production origin, and perform the hosted checks below. No services,
paid disks, deployments, commits, or pushes are authorized by these instructions.

## Versions and local operation

Use Python **3.12** and Node **24** (npm from Node 24). Backend requirements are pinned;
frontend dependencies use `npm ci`. Vercel's root is `frontend`; Render's root is `backend`.

From the repository root:

```sh
python3.12 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
cd frontend
npm ci
cd ../backend
DEMO_MODE=local LLM_MODE=deterministic DATABASE_PATH=./data/sessions.sqlite3 ../.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --no-access-log
```

In another terminal run `cd frontend && npm run dev`. Open `http://127.0.0.1:5173`.
Vite forwards `/api/*` to backend `/*` at port 8000. Local mode uses an HttpOnly,
SameSite=Strict cookie without Secure so loopback HTTP works. Never expose local
mode to the internet. Environment files are examples; the process must explicitly
receive variables (the app does not automatically load `.env`).

## Render web service

- Runtime: Python; branch: `deployment/public-demo` when explicitly authorized.
- Root directory: **`backend`**.
- Build command: **`pip install -r requirements.txt`**.
- Start command: **`uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --limit-concurrency 50 --timeout-keep-alive 5 --no-access-log`**.
- Health check path: **`/health`**. Expected HTTP 200 with `{"status":"ok","mode":"deterministic"}`.
- One service instance, one worker; do not horizontally scale file-backed sessions.

Set these environment variables:

| Variable | Value |
| --- | --- |
| `PYTHON_VERSION` | `3.12.12` (Python 3.12 runtime) |
| `DEMO_MODE` | `public` |
| `LLM_MODE` | `deterministic` |
| `DEMO_ORIGINS` | `https://YOUR-VERCEL-PROJECT.vercel.app` or your exact HTTPS custom origin |
| `DATABASE_PATH` | `/tmp/bloom-demo/sessions.sqlite3` for disposable free hosting; `/var/data/bloom/sessions.sqlite3` with an approved disk mounted at `/var/data` |
| `PORT` | Supplied by Render; do not hardcode |

No `DEMO_API_TOKEN`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`, or client
secret is needed. Do not configure a paid-model credential. `DEMO_ORIGINS` accepts
comma-separated exact origins without trailing slashes; no wildcard. Explicitly add
individual preview origins if needed; arbitrary Vercel previews are intentionally denied.
`CORS_ORIGINS` is obsolete. Unset it to avoid operator confusion.

Use a **fresh** `DATABASE_PATH`. The path is now the session registry, with private
workspaces in the adjacent `<DATABASE_PATH>.workspaces/` directory. Legacy single-user
databases are refused rather than being exposed or silently migrated.

## Vercel frontend

- Root directory: **`frontend`**; framework preset: **Vite**.
- Node version: **24.x**; install command: **`npm ci`**.
- Build command: **`npm run build`**; output directory: **`dist`**.
- No frontend environment variables or secrets.
- In `frontend/vercel.json`, replace **`REPLACE-WITH-RENDER-SERVICE`** with the actual
  Render service hostname. Keep the ordered external `/api/:path*` rewrite first:
  `/api/applications` must become `https://SERVICE.onrender.com/applications`.
  The second rule serves the SPA for non-API paths; unknown API routes must stay JSON 404s.
- Keep API responses uncached. The backend and rewrite emit `Cache-Control: no-store`.
  Keep the checked-in CSP and other security headers.

The browser only talks to its Vercel origin. The external rewrite forwards cookies,
Origin, CSRF headers and Set-Cookie responses. Cookies intentionally have **no Domain**,
so the browser binds them to the visible Vercel host. Public cookies use the `__Host-`
prefix, Secure, HttpOnly, SameSite=Strict, Path=/ and a one-hour absolute lifetime.
No cross-site cookie permission or credential wildcard is needed. The Render URL is
publicly reachable, but cannot access a Vercel visitor's host-only cookie. CORS is not
used as authentication: every data operation also requires the random session cookie.

`POST /session` requires an exact allowed Origin and returns a session-bound CSRF
value; the frontend retains it only in memory. All subsequent POST/DELETE actions
require both that Origin and `X-CSRF-Token`. The CSRF token is not a bearer session
credential. Missing/expired sessions return 401; reload creates a new fictional workspace.
No consequential mutation is automatically retried after expiry or reset.

## Retention, capacity, and persistence

Each session lasts **one hour**, without sliding extension. Reset deletes only that
session's database and invalidates its cookie; the next handshake creates fresh seeds.
Expired workspaces are deleted on requests and by a background sweep every 60 seconds
while the process runs. A stopped service cannot execute cleanup; startup sweeps before
serving authenticated data. Orphan workspace files are reclaimed under the same lock.

Limits: **100 live sessions**, **180 requests/session/minute**, **40 mutations/session/minute**,
**1,200 registry requests/minute globally**, **16 KiB request bodies**, **5-second body
read timeout**, **200 events before another draft resolution is denied**, and a **256-page
SQLite limit per workspace** (normally 1 MiB at 4 KiB/page). Five seeded applications
bound successful approvals, saved answers and receipts. Oversize/invalid requests are
rejected; no upload endpoint exists. Limit responses use 429/503; reset remains available
once the per-minute limit clears. Session creation is globally bounded; cookie rotation
and spoofed forwarded IPs cannot evade global limits. These limits control resource
use, but cannot promise availability under a distributed denial-of-service attack.

All requests hold a registry transaction through workflow execution, serializing this
small deterministic demo across app instances sharing the same files. This deliberately
prioritizes isolation and safe cleanup/reset over throughput. Lock contention returns a
sanitized 503. Never use this design for a production multi-user recruiting system.

**Render Free has an ephemeral filesystem. Restart/redeploy/spin-down can erase the
registry, workspaces and receipts. SQLite does not make free-tier storage persistent.**
After storage loss visitors receive 401 and start fresh; previous mock receipts cannot
be recovered. State this limitation to demo viewers. Free service cold starts can delay
requests; preserve uncertainty wording rather than automatically retrying submissions.

For a reliable scheduled demo, obtain approval for a paid Render service with a persistent
disk mounted at `/var/data`, put **both** registry and adjacent workspace directory there,
and retain one instance. Test a restart with the same cookies and verify receipts survive.
Disk attachment has cost and deployment availability implications; nothing provisions it
here. Long-term scaling would require a separately designed transactional shared database.
Do not restore backups containing expired session data: this disposable dataset needs no
backups. Restoring old session databases could resurrect expired/reset workspaces.

## Verification before publication

Run from the repository root:

```sh
.venv/bin/python -m pytest -q backend/tests
.venv/bin/ruff check --config backend/pyproject.toml backend eval scripts
.venv/bin/ruff format --check --config backend/pyproject.toml backend eval scripts
.venv/bin/mypy --config-file backend/pyproject.toml backend/app
.venv/bin/python eval/run_eval.py
cd frontend
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
npm run e2e -- recovery.spec.ts
npx playwright test --config playwright.public.config.ts
```

The public browser test uses OpenSSL, a temporary self-signed localhost certificate,
a real public-mode FastAPI server, and an HTTPS proxy serving the production build.
It verifies browser cookie handling, CSRF, isolation, uncertain receipt reconciliation,
reload, reset, API 404 and SPA fallback. It does **not** prove Vercel's hosted behavior.
Standard browser installation: `npx playwright install chromium` (requires network).

After deployment is separately authorized:

1. Check Render `/health` and Vercel `/api/health`; both must report deterministic mode.
2. In two separate browser profiles, complete the same mock application. Verify distinct
   receipts and private saved answers/history; reset one profile and confirm the other is intact.
3. Inspect `/api/session`: Secure/HttpOnly/Strict host-only cookie; no secrets in JS;
   `no-store` on session and all API responses. Verify the browser sends the cookie back
   through Vercel, and missing/wrong CSRF or foreign Origin mutations return 403.
4. Complete Lantern Demo's timeout then status check; reload and retry status without
   another acceptance. Open a non-API deep link and an unknown `/api/...` route.
5. If using an approved disk, restart Render and repeat status checks with existing cookies.
6. Confirm old/expired cookies return 401; verify no paid API key exists in either service.

Do not announce readiness until these hosted checks pass. No hosted verification has
been performed in the repository preparation task.

## Rollback

Pause public traffic (Vercel deployment protection or a maintenance deployment) first.
Restore a previously verified **session-isolated** frontend/backend pair using each
provider's deployment rollback UI, preserving exact origins and deterministic settings.
Do not roll back to the legacy public-token server. If no verified safe pair exists,
keep the demo offline. Do not restore expired/reset session data. On a storage/schema
incompatibility use a fresh registry path and deliberately invalidate existing sessions;
fictional state loss is preferable to mixing workspaces. Re-run health, isolation, CSRF
and timeout checks before re-opening access. These are operator steps, not actions
performed by the agent.

Provider references: [Vercel external rewrites](https://vercel.com/docs/routing/rewrites),
[Render web services](https://render.com/docs/web-services),
[Render Free limitations](https://render.com/docs/free),
[Render persistent disks](https://render.com/docs/disks).
