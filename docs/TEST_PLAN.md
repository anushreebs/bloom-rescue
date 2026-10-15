# Test plan

All tests use fictional c-demo data and local mock ATS; no Bloom account or external application is exercised.

- Pytest: API contracts, revision conflicts, model safety, transitions, consent/revocation, concurrent/idempotent mock submission, and cross-service reuse regression.
- Vitest/RTL: component interactions and initial error feedback. Exact counts are recorded by the final execution, not this plan.
- Playwright Chromium: all five seeded scenarios in sequence, including unsupported edit rejection, sensitive confirmation, explicit opt-in reuse, revoke-all, receipt persistence after reload, timeout reconciliation and a different client retry key.
- Browser network interception: initial API outage then recovery.
- Keyboard: first skip link, Enter activation and programmatic review focus; this is a partial keyboard check, not a complete keyboard audit.
- Viewport: 320×812 CSS px with reduced motion, page overflow assertion and screenshot.
- axe: WCAG2A/AA and WCAG2.1AA tags, assert no serious/critical findings in queue, review, sensitive, submitted, uncertain and mobile states. Automated checks do not prove WCAG conformance or screen-reader behavior.

Playwright runs against a dedicated SQLite test database. Repeated execution must reseed this database. Never delete or reset a user's regular demo database for a test. Run from frontend: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/bloom-chromium npm run e2e` after `npm run browser:prepare` when standard Playwright Chromium is unavailable.

Not covered: live LLM API without credentials, real ATS, browser matrix, real assistive technology, native browser zoom, production authentication, load at production scale.
