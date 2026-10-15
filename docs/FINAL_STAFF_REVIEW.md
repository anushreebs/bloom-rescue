# Final council: staff software engineer

Independent critique by specialist 12; other final council reviews were not consulted. Assessment concerns this local fictional prototype, not Bloom's implementation.

## Readiness

**Final checkpoint: 8/10 for a reviewable local prototype; not production-ready.** Strict frontend typing and 81 backend tests pass independently. The P1 restart recovery defects identified in review were fixed and regression-tested. No outstanding P0/P1 defect was identified in this bounded inspection. Live provider demonstration is still incomplete, so the full requested release gate is not satisfied.

## Three most important weaknesses

1. **Recovery guarantees are adapter-specific.** The architect fixed crash-before-accept recovery after this review: an authoritative negative local status permits a safe application-idempotent submission. Tests now cover restart with and without an accepted receipt. Preserve that explicit contract; any future real ATS adapter must prove comparable status/idempotency guarantees or escalate uncertainty to human intervention. Do not generalize local mock safety to external employers.
2. **AI quality evidence is narrower than the feature description.** Exact extraction, topical rules and schema validation are credible guardrails, but cannot establish factual truth, semantic adequacy, currentness or general prompt-injection resistance. The 35-case set is a known regression set after remediation. Run a previously untouched holdout and a genuinely configured provider; compare against the deterministic implementation, including abstention and adequacy, before claiming AI benefit.
3. **Maintainability and boundary validation remain prototype-level.** React concentrates state, actions and substantial presentation in one component; API generics assert rather than parse runtime types. Extract review/editor, receipt/history and saved-permission components; add runtime boundary validation where it materially protects against malformed responses. Retain SQLite and the small state machine until measured requirements justify complexity.

## Strengths

Human approval and consent are separate actions. Deterministic state transitions constrain model output. SQLite persists audit transitions and mock ATS receipts; idempotency does not depend on arbitrary browser keys. Network calls run outside application write transactions. UI labels distinguish independent fictional behavior, mock receipts and deterministic/API mode. These are meaningful engineering decisions beyond a frontend-only demonstration.

## Missing evidence

No actual API-backed model run, independent held-out evaluation, real user study, production ATS integration, tenant authentication, multi-user load test, broad browser/screen-reader assessment or remote CI execution was verified by this reviewer. These omissions must remain visible in the submission. No P0 defect was found in this limited review; that is not proof that no security defect exists.

## Recommendation

The no-receipt recovery P1 is now fixed; the full backend suite passes 81 tests, including all three restart/lease regressions. This is a credible local engineering demonstration with an explicitly incomplete live-API gate and production claims deferred. A short demo should show a supported draft, an unsupported abstention, explicit personal confirmation, consent/revocation and both accepted-timeout and pre-acceptance recovery.
