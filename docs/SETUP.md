# Reproducible local setup

Requirements: Python 3.12 and Node.js 24 with npm. Run from the repository root. No production service, login, real candidate data, or model credentials are needed for deterministic mode.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
cd frontend
npm ci
npx playwright install chromium
cd ..
```

The environment example is a reference: the app reads process environment variables, not an automatically loaded `.env` file. In terminal one:

```sh
cd backend
LLM_MODE=deterministic ../.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In terminal two:

```sh
cd frontend
npm run dev
```

Open http://127.0.0.1:5173. Health check: `curl http://127.0.0.1:8000/health`. Vite proxies `/api` to the backend. The public local token `local-demo-token` is a demo boundary, not production authentication. Do not expose these development servers to the internet.

## Checks

```sh
.venv/bin/ruff check backend
.venv/bin/ruff format --check backend
.venv/bin/mypy --config-file backend/pyproject.toml backend/app
cd backend
../.venv/bin/python -m pytest
cd ../frontend
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run e2e
```

Playwright starts local backend and frontend processes and runs Chromium. Set `CI=1` to prevent reusing unrelated running servers. The deterministic backend uses a SQLite file; the E2E launcher creates a fresh temporary directory and absolute test database per run. Never use real personal information.

## Optional live provider

Explicitly set `LLM_MODE=api`, `OPENAI_API_KEY` and an appropriate `OPENAI_MODEL` in the backend process only. `OPENAI_BASE_URL` defaults to the provider's API. Do not put a key in frontend variables or source control. Only fictional evidence should be sent. API mode incurs provider charges and can fail, unlike offline deterministic mode. A configured client is not evidence that a live call passed: record the actual model, evaluation date and outcome separately. No key was available during initial configuration.

## Dependencies and CI

`backend/requirements.txt` pins the complete installed Python dependency set. `frontend/package-lock.json` records exact npm dependency resolution; use `npm ci`, not `npm install`, when reproducing. GitHub Actions defines separate backend, frontend and Chromium E2E jobs. Local results do not prove an unexecuted remote CI workflow passed. Formatting tools are Ruff for Python and Prettier for frontend source. Automated checks cover a subset of accessibility and security concerns, not certification.

## Browser CDN fallback verified in this environment

Standard Playwright browser downloads returned invalid archives in this environment. The pinned `@sparticuz/chromium` development package provides an alternative Linux binary through npm:

```sh
cd frontend
npm run browser:prepare
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/bloom-chromium npm run e2e
```

The fallback was launch-tested with a local HTML page. This does not substitute for application E2E results. Normal CI uses Playwright's browser installer. The fallback Chromium version differs from Playwright's recommended version, which limits browser-compatibility conclusions.

## Python type-checker build

Requirements pin mypy 1.18.2 and request its pure Python wheel (`--no-binary=mypy`). A compiled newer mypy crashed with SIGBUS in this container. A source reinstall initially left older extension files shadowing the Python modules; removing those stale artifacts allowed actual type errors to be reported. This is an environment workaround, not a waiver of type checking. Fresh virtual environments are recommended; do not reuse a partially modified environment.

E2E always starts a fresh backend and resets only the three specifically named `playwright-demo.sqlite3` database files. Stop an unrelated service on port 8000 before running E2E; it is never silently reused.
