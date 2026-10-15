> Historical local-prototype review. The token and local-only deployment constraints below are superseded for the new public-demo mode by [PUBLIC_DEMO_SECURITY.md](PUBLIC_DEMO_SECURITY.md) and [DEPLOYMENT.md](../DEPLOYMENT.md). Original findings remain recorded as historical evidence.

# Security review

## Scope and outcome

Independent review of the fictional local demonstration, 14 October 2026. Inspected backend `main.py`, `db.py`, `schemas.py`, `ai.py`, `ats.py`, frontend API configuration and startup instructions. No real Bloom endpoints, production systems, or real candidate records were tested.

No demonstrated P0/P1 defect remains in the tested local boundary. This is a bounded source/test review, not a penetration test, certification, production approval, or claim that all attacks have been excluded.

## Verification performed

Command: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_security.py -q`

Result: **13 passed**, 0.39 seconds in the initial run. One upstream Starlette/httpx TestClient deprecation warning. Runtime is deterministic mode; these results do not establish live provider behavior.

The security suite covers all seven protected route patterns with missing/wrong tokens; server-owned identity and state; isolation of foreign application/evidence/revocation records; fabricated answer suffix rejection; no retention without consent; sensitive confirmation; exclusion of sensitive answers from audit details; provider error redaction in response and captured logs; and rejection of unconfigured CORS origin.

Related API/workflow suites independently cover stale revisions, timeout reconciliation, restart persistence, revocation, illegal transitions, and duplicate acceptance. Their pass counts belong to the consolidated test report, not this suite's 13.

## Findings and decisions

| Priority | Finding | Decision / evidence |
|---|---|---|
| Deployment constraint | Public fixed demo token provides no user identity or production access control | Accepted only for loopback fictional single-user demonstration; `BUILD_AND_RUN.md` documents this explicitly. No public deployment approval. |
| Safety boundary | AI output cannot directly approve or submit | API requires explicit approval and trusted transition policy. Technical edits require whole-evidence support; unsupported draft cannot be approved. |
| Privacy boundary | Retaining an approved answer is opt-in and revocable | Consent defaults false; protected list/revoke endpoints; revoked source disappears from future retrieval. Prior approved application/receipt is deliberately not recalled. |
| Reliability boundary | Client retry key alone is insufficient for deduplication | Mock adapter enforces one persistent receipt per application; backend reconciles ambiguous acceptance before retry. |
| P3 robustness | `hmac.compare_digest` string operands reject non-ASCII token text with TypeError | Reported to architect for encoding or explicit rejection; valid/wrong ASCII token behavior is tested. This does not bypass authorization. |
| Evaluation limitation | Lexical topic/contradiction/injection rules are incomplete | Extractive verification is provenance validation, not general truth or semantic relevance certification. Broader adversarial evaluation is required before richer evidence or real candidates. |

## Residual risks and missing evidence

- Local filesystem access permits reading or modifying SQLite and environment. No encryption-at-rest claim.
- Browser header token is public by design. CORS is an origin control, not authentication.
- Arbitrary prompt-injection phrasing cannot be eliminated by regexes. Deterministic extraction and no automatic submission limit consequences; evidence truth and semantic completeness remain separate questions.
- No real tenant, credential lifecycle, rate limiting, production observability, or disaster recovery evaluation.
- API mode requires explicit configuration. Source-level strict-schema and safe error inspection plus mocked tests do not prove an actual paid-provider request succeeded.
- Dependency configuration was inspected, but a complete supply-chain/advisory audit and pinned artifact provenance assessment were not performed.
- Logs intentionally retain event metadata only. The approved human answer persists as application data for this local workflow, including sensitive answers; revoking optional reuse is not deletion of application history. A production retention/deletion policy must be designed separately.

## Recommendation

Ship only as a clearly labeled local fictional prototype with unresolved gates disclosed. Do not use real resumes, expose the service publicly, or represent mock receipts as employer confirmations. See `THREAT_MODEL.md` for controls and release-blocker definitions.

Lead disposition: non-ASCII comparison robustness fixed by comparing encoded bytes. Fixed token remains a published local-demo boundary, not authentication. No public deployment approved.
