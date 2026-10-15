# Independent staff engineering review

Reviewer: specialist 12. Scope: actual React, API, persistence, AI verification, workflow and mock ATS code on 14 October 2026. This reviewer did not author those implementations. This is a bounded local prototype review, not a production security assessment.

## Findings and required decisions

| Priority | Finding and code evidence | Consequence | Required action / status |
|---|---|---|---|
| P1 | `main.py` commits `resolving` before model work; initial `workflow.py` rejected retry from that state. Initial React UI offered only refresh. | A process death can leave a durable application stranded indefinitely. | Architect accepted explicit stale-resolution lease recovery plus regression tests. Pending independent patch check. |
| P1 | Backend permits reconciliation from `submitting`, but initial React rendering exposed status-check only for `verification_required`. | A restart between persisted submit-start and outcome can hide the safe recovery path from the user. | Architect accepted exposing status check for submitting. Pending patch check. |
| Gate blocker | Initial independent `npm run typecheck` failed in `e2e/recovery.spec.ts:8`: two incompatible Playwright `Page` types. | Build/type gate cannot be marked passed. | Align axe/Playwright dependency types; rerun strict checks. Reported to architect. |
| P2 | Technical approval rechecks exact extraction but initially does not recheck question coverage after an edit (`main.py:approve`). | User can remove a necessary topic from an otherwise supported compound draft. This is an incomplete answer, not fabricated experience. | Add a coverage check or explicitly scope editing to complete verified answers. |
| P2 | Frontend `api.ts` returns parsed JSON using `as T`; this is a TypeScript assertion, not runtime validation. | Malformed API responses can break rendering despite static types. | Backend response models constrain normal endpoints; add boundary parsing if broader or externally integrated use is attempted. |
| P3 | Most React view/state/actions remain in one large `App.tsx`. | Changes to recovery, consent and history become harder to isolate. | Split question review, receipt/history and saved permissions after critical behavior stabilizes; no extra framework needed. |

## What is strong and should remain

- Deterministic transition policy owns approval/submission. Neither model output nor a successful draft silently approves or sends an application.
- SQLite transactions persist state and events together. Slow model/adapter work runs outside write transactions, then optimistic revisions reject stale results.
- Mock ATS enforces one accepted row per application; acceptance is committed before simulated response loss. Reconciliation is based on stable application identity, not an arbitrary retry key.
- Whole-source extraction prevents a model from appending unsupported prose or deleting negation within a quotation. Documentation correctly limits this to provenance, not semantic truth.
- Sensitive fields require explicit human entry and confirmation. Saved-answer reuse has a separate consent decision and revocation endpoint.
- Fictional/demo and deterministic/API mode labels are visible. No observed Bloom defect is asserted merely because this prototype exists.

## Verification independently executed

- `PYTHONPATH=backend .venv/bin/python -m pytest -q backend/tests`: **77 passed**, one dependency deprecation warning, at this checkpoint.
- `PYTHONPATH=backend .venv/bin/python eval/run_eval.py --mode deterministic`: **35/35 labeled cases**, **8/8 direct verification probes**. These are known regression cases after remediation, not a generalization estimate; the initial 27/35 record remains important.
- First `npm run typecheck`: failed as described above. This must be rerun after dependency fixes.
- React component tests separately launched; final outcome and subsequent patch checks recorded below.
- Root-level bare pytest failed collection because the project intentionally configures pytest under `backend`; documented backend invocation works. This is not a backend test failure, but copy/paste run commands must retain their working directory.

## AI and architecture assessment

The configurable structured-output API client is substantive scaffolding, but no actual provider credentials were available. Deterministic extraction can demonstrate orchestration, schema checks, provenance, human review and recovery. It does not demonstrate measured LLM quality, API latency/cost or a live model call. That release gate remains incomplete.

Topic/qualifier/contradiction checks are conservative English lexical rules. They may reject good evidence and miss nuanced contradictions, temporal changes or paraphrased instruction attempts. The verifier checks equality against trusted local sources; it cannot establish the truth of those sources. Keep these limitations explicit and retain unsupported cloud questions as abstentions. Do not invent a negative cloud-experience statement from missing evidence.

The single-user public token and local SQLite repository are reasonable bounded choices for fictional local use. They are not tenant authorization, production authentication, concurrency capacity evidence or an internet deployment architecture. A new framework, vector database, multi-agent runtime or real ATS adapter is not justified by this five-scenario demo.

## Decisions, risk and architect approval

Approve the bounded architecture for local demonstration once P1 recovery defects and strict build/type blockers are fixed and tested. Do not describe all release gates as complete while the live API demonstration is unavailable. No P0 defect was identified in this inspected scope; absence of a finding is not proof of security. Continue with a small held-out evaluation and real provider run before claims of AI benefit over deterministic rules.

## Final independent reassessment checkpoint

After integration changes, the reviewer independently reran backend tests: **80 passed** (one dependency deprecation warning). `npm run typecheck` now exits successfully. Code inspection confirms an expired 120-second resolution lease can be retried and a late earlier result is rejected by revision; active resolution remains protected. React now exposes a retry for resolving and a status check for both submitting/verification-required. Approval now scopes deterministic coverage validation to the selected edited evidence; duplicate evidence text is deduplicated before extraction checks.

The initial two P1 findings are addressed for stale resolution and **already-accepted** submissions. A further **P1** was reported to the architect: a crash after `submit_start` but **before** mock ATS acceptance leaves no receipt. The current reconciliation branch never submits when status is absent, so repeated checks remain pending indefinitely. The mock adapter has authoritative durable status and application-unique acceptance, making an explicitly documented safe retry possible. This must be tested separately from timeout-after-accept before clearing P1s. Real ATS status absence would not automatically carry the same guarantee.

### Final P1 resolution

The architect changed no-receipt reconciliation to consult the authoritative local mock status, then safely submit under the adapter’s application-unique acceptance constraint. Independent inspection confirms the real-ATS limitation is documented at the branch. The new `test_restart_before_adapter_acceptance_recovers_safely` verifies a restarted submitting application without a receipt reaches submitted once. The reviewer reran the full backend suite: **81 passed**, one dependency warning. Thus the reported P1 recovery findings and typecheck blocker are resolved in this local scope. No remaining P0/P1 was identified; live API execution remains an incomplete release requirement, not a simulated pass.
