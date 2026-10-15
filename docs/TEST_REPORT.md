# QA execution report

14 October 2026. Actual automated tests against the local fictional demonstration, deterministic evidence mode. This report does not describe testing of Bloom production.

## Commands and outcomes

- `cd backend && ../.venv/bin/pytest tests/test_integration.py -q`: **1 passed**, 0.24s test time. Regression covers consent-generated duplicate evidence, next-application reuse, revocation and receipt-preserving terminal retry. One upstream Starlette/httpx deprecation warning.
- `cd frontend && npm run browser:prepare`: Chromium extracted successfully to `/tmp/bloom-chromium`.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/bloom-chromium npm run e2e`: **3 passed**, 8.4s initial successful complete run. A final repeat run passed all 3 tests in **7.7s**, writing six machine-readable axe outputs under artifacts/axe.

## Exercised outcomes

1. All five seeded applications: supported REST approval/submission; unsupported cloud answer remains empty and blocked; authorization requires a manually supplied fictional answer and explicit confirmation; contextual prior-answer reuse still requires approval; timeout-after-accept shows uncertainty before status reconciliation.
2. Unsupported technical edits are rejected and retained for correction. Consent starts unchecked, saving is optional, revoke removes future reuse permissions, and reloading preserves the already submitted application.
3. Retrying the submitted timeout scenario with a different client key and stale revision returns the same single mock acceptance (`submission_count=1`). This is mock adapter evidence, not a production ATS guarantee.
4. API-unavailable initial loading shows an error and Retry succeeds after intercepted network failure is removed.
5. Partial keyboard, 320-pixel responsive and automated accessibility checks are detailed in ACCESSIBILITY_REPORT.md.

## Defects discovered and disposition

**P1, fixed:** saving an approved REST answer created a second evidence item with identical text. A subsequent unedited reuse draft was rejected on approval because the backend assembled duplicate claims. This was reproduced through the real browser, escalated to the architect/backend owner, fixed by text deduplication, then passed both the browser flow and dedicated integration regression.

Test infrastructure fixes: align Playwright dependency types with axe; isolate/reseed the named Playwright SQLite database; add backend import path to the E2E launcher. Earlier runs failed during implementation/infrastructure changes; those failures are not reported as passes. A successful repeatable run followed the fixes.

## Evidence

`frontend/e2e/recovery.spec.ts`, `backend/tests/test_integration.py`, and four full-page screenshots under `artifacts/screenshots/`: queue, mock submitted, uncertain status, and 320-pixel view. Images show actual fictional UI, not Bloom production or a recording of a live employer application.

## Remaining limits

No live model API test without credentials, real employer integration, cross-browser suite, full keyboard task audit, screen reader, real browser zoom audit or production load test. Other specialist suites have separate reports; their counts are not inferred here.

## Lead final integration

Full backend suite:81 passed; configured mypy8applicationfiles, Ruff lint/format passed. Four componenttests and productionbuild passed. A subsequent browser run after restart recovery fixes passed3tests in7.5seconds. These counts are separate suites, not independent evidence of production safety. Upstream Starlette/httpx testclient deprecation warning remains.

Final repeat exposed stale named test data on one run. The launcher now uses a new temporary directory and absolute database per process rather than unlinking a reusable filename. A targeted five-scenario rerun passed before that infrastructure change; final complete-suite results are recorded in the implementation handoff. No application-data reset is exposed or required.

After temporary-database isolation, final complete Playwright run:3/3passed in7.3seconds. Six regenerated axe outputs each contain zero violations. Screenshots correspond to this final source version.
