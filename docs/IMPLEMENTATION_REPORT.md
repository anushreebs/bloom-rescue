# Bloom Rescue — implementation and evaluation

## Recommendation and status

Use this as a bounded **independent fictional engineering demonstration**. It explores recovery from an employer-specific question without claiming Bloom's existing recovery workflow is absent or broken. Keep the original assignment response short; offer this prototype as optional supporting work.

The deterministic application is runnable and the tested local journeys pass. **The complete requested release is not finished:** actual API-backed model execution remains an incomplete gate because no model credential was configured. Production deployment is outside scope.

## Built

| Area | Implemented behavior | Evidence |
|---|---|---|
| Frontend | React/TypeScript/Vite recovery queue, evidence/editor, explicit approval, consent, submission outcome, audit history, revocation | `frontend/src`, four component tests, browser screenshots |
| API and persistence | FastAPI/Pydantic, SQLite, fixed fictional owner, revision conflicts, safe errors | `backend/app`, API and security tests |
| AI | Lexical retrieval, strict JSON evidence selection, exact-source verification, sensitive abstention, bounded provider retries | `backend/app/ai.py`,32AI tests, evaluation artifacts |
| Recovery | Durable mock acceptance, stable logical identity, status reconciliation, restart before/after acceptance, stale draft lease | ATS/workflow modules and recovery tests |
| Tooling | Locked dependencies, local setup, lint/format/type checks, Git and CI configuration | BUILD_AND_RUN, lockfiles, `.github/workflows/ci.yml` |

No real employer submission, Bloom API integration, payment, production identity service or unnecessary product-side multi-agent runtime was built.

## Verification at final integration checkpoint

| Check | Result | Interpretation |
|---|---|---|
| Backend Pytest | **81 passed** | Includes AI HTTP doubles, API, workflow, security, reuse and restart tests; one upstream deprecation warning |
| React/RTL | **4 passed** | Approval/consent, sensitive confirmation, unsupported escalation, persisted processing controls |
| Playwright | **3 passed** | All five fictional scenarios, network recovery, partial keyboard and320px reflow; actual Chromium fallback |
| Axe | **6 scans, zero violations** | Selected states/rules in one browser; not full WCAG conformance |
| Frontend checks | Build, strict TypeScript, ESLint, Prettier passed | Source and E2E type compatibility fixed |
| Python checks | Ruff lint/format and configured mypy passed,8appfiles | Mypy checks untyped function bodies; this is not a fully strict annotated Python codebase |
| Deterministic evaluation | **35/35 questions,8/8 verifier probes** | Same frozen set after8initial failures; six final nonempty answers. Not held-out generalization |
| Live provider | **Incomplete** | HTTP doubles do not establish live compatibility, model quality, cost or latency |
| Remote GitHub Actions | **Not run** | Workflow provided; local results do not prove remote execution |

Commands and conditions are in TEST_REPORT, ACCESSIBILITY_REPORT, EVALUATION_REPORT and PERFORMANCE_REPORT. Initial evaluation was27/35. Labels were preserved and weaknesses repaired rather than rescored. Two additional throughput/encryption probes still show incomplete-question coverage despite exact quotations; see FINAL_AI_REVIEW.

## Important defects found and fixed

1. Consent-saving identical evidence broke later approval: deduplicate claim text; actual browser and API regression now pass.
2. Source-faithful drafts could miss requested duration, professional/production context, leadership or compound topics: conservative coverage checks added. These remain bounded lexical checks.
3. Restart could strand resolving/submitting states: two-minute resolution lease and explicit reconciliation controls added; restart windows before and after acceptance tested.
4. Edited answers could drop required topics: approval now checks scoped coverage as well as extraction.
5. Playwright/axe types blocked the build; aligned dependency versions. Mypy native tooling crashed; pure Python installation enabled actual checking and exposed errors that were fixed.

## Council decision

Twelve real specialists contributed product, UX, frontend, backend, AI, workflow, security, performance, QA, evaluation, DevOps and independent code review. Four final role critiques were collected before sharing conclusions. Some specialists returned in final roles; the AI lead explicitly discloses earlier AI-module authorship, so this is not described as an independent audit of that module. Separate evaluation and staff review supplied independent checks.

Founder6/10: validate user need and a-cloud handoff. AI lead6/10: live provider, adequacy and holdout gaps. Staff8/10: local implementation reviewable after P1 fixes, with real-adapter boundaries. Hiring7/10: useful internship discussion evidence, but applicant understanding must be demonstrated personally. Scores are qualitative judgments for different standards and are not averaged.

Decision: keep the demo bounded; do not add more features before testing the opportunity and model value. No outstanding P0/P1 was identified in the limited final local review; that is not proof of absence of defects. Security and adoption are not established for production.

## Next validation

1. Personally run and explain every critical path. Trace a revision check, invalid edit, consent revocation, provider failure and ambiguous receipt. Do not claim unaided authorship or knowledge that has not been acquired.
2. With explicitly configured credentials, run fictional cases through a real provider; record model, token usage, latency, malformed/refused behavior and actual call counts. Compare against the existing deterministic selector on untouched cases. Keep rules if the model adds no measurable value.
3. Validate authentic interrupted-question needs and existing Bloom recovery capabilities with authorized research. Compare manual answer entry, this deterministic workflow and API mode on task completion, corrections and time. Conversion/revenue effects remain hypotheses; measure them later rather than promising gains.

## Evidence appendix

Actual synthetic UI screenshots: `artifacts/screenshots/01-queue.png`, `02-submitted.png`, `03-uncertain.png`, `04-mobile-320.png`. Raw automated accessibility outputs: `artifacts/axe`. Evaluation inputs and initial/final results: `eval`. No real candidate screenshots or secrets are included in this source package.

## Remaining limits

Unsupported cloud information stops at review; new evidence intake/manual technical attestation is deferred. Sources are trusted synthetic seed data, not verified real-world qualifications. Quotation support does not prove source truth, completeness, freshness or general prompt-injection resistance. Local mock negative status is authoritative; real employer status may not be. Public demo token is not authentication. No broad browser/screen-reader/zoom audit, live model benchmark, production load study or real ATS test was performed. Database reads follow a small-queue N+1 pattern. React state and presentation could be decomposed further; frontend API generics do not perform runtime schema parsing.

Final browser checkpoint after test-database isolation:3tests passed in7.3seconds, six regenerated axe scans had zero violations. The failed stale-data run is documented in TEST_REPORT rather than omitted.
