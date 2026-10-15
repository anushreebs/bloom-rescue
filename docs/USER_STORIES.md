# User stories and acceptance criteria

These are proposed needs for a fictional candidate, not findings from customer research. API/state details are governed by `../CONTRACTS.md`.

| Priority | Story | Acceptance criteria |
|---|---|---|
| Must | As a candidate, I can see which application needs my attention and why. | Queue shows fictional role/company/question and a text state; no outcome depends on color alone; selecting an application opens its review. |
| Must | I can understand why an answer was drafted. | Evidence sources and exact quoted claims are visible; unknowns are explicit; unsupported evidence cannot silently become a supported draft. |
| Must | I can review and edit before anything is sent. | Resolve never approves/submits; approval is an explicit action; stale revision conflicts preserve the current server state; unsupported technical edits are rejected with a clear reason. |
| Must | I retain control over sensitive answers. | Authorization/compensation/eligibility are not inferred; a required confirmation precedes approval; no preselected confirmation. |
| Must | I can resolve missing information without being misrepresented. | Missing cloud evidence yields no fabricated claim; UI states what information is needed; manual factual additions, if supported, are explicitly human-provided and do not acquire a verified-evidence label. |
| Must | I can safely resume after an uncertain outcome. | A timeout following ATS acceptance enters verification_required; retry reconciles; repeat/new-key calls cannot create a second accepted submission; refresh/restart preserve receipts. |
| Must | I can choose whether an answer is retained for reuse. | Consent is unchecked by default; only consented approved answers are saved; revocation removes future retrieval eligibility without pretending to undo a submitted application. |
| Must | I can complete review using keyboard and a narrow screen. | Visible focus, labels, error association and status announcements exist; controls remain reachable at mobile width; reduced-motion preference is respected. Executed accessibility checks are reported with limits. |
| Should | I can learn what happened after an error. | Safe actionable error, retry and audit events are shown; raw provider exceptions/secrets and sensitive answer contents are not logged. |
| Should | I can tell what is simulated. | Persistent independent-demo identity; deterministic/API mode is accurately stated; mock acceptance never reads as employer confirmation. |

## Scenario walkthrough

Select **a-rest** → read blocking question → resolve → inspect sources and draft → edit/review → optionally consent to reuse → approve → resume → inspect mock receipt and events. No resume is available before approval. For **a-timeout**, the first resume produces an uncertain outcome, then verification checks the same logical submission and shows one accepted receipt. For **a-cloud** and **a-auth**, uncertainty cannot be bypassed by the model.

## Definition of acceptance

Acceptance criteria are requirements, not test results. QA records actual runs separately. A missing API credential means API-backed generation is **not demonstrated**, even when deterministic scenarios pass. No supported claim of real-user speed, conversion or hiring outcome follows from passing these tests.
