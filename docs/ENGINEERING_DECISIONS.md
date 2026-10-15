> Historical local-prototype review. The token and local-only deployment constraints below are superseded for the new public-demo mode by [PUBLIC_DEMO_SECURITY.md](PUBLIC_DEMO_SECURITY.md) and [DEPLOYMENT.md](../DEPLOYMENT.md). Original findings remain recorded as historical evidence.

# Engineering decisions

## D01 — Independent, fictional demo
No real Bloom integration or employer submission. Actual Bloom review did not establish a broken recovery flow; this is an opportunity hypothesis. All candidate and company records are synthetic.

## D02 — Small deterministic workflow around an optional model
React → FastAPI → retrieval → structured selection → extractive verification → explicit human approval → durable mock ATS. The model cannot approve or submit. SQLite and plain functions avoid an unnecessary agent runtime.

## D03 — Verification is deliberately narrow
Complete source text must be preserved. This demonstrates provenance checking, not proof that a profile is true or a general semantic entailment system. A simpler deterministic selector is the primary comparison baseline. Model value must be evaluated separately.

## D04 — Missing cloud evidence escalates
Missing evidence does not establish either experience or its absence. The unsupported-cloud scenario stops at review; ingestion and provenance for new human-supplied technical evidence are deferred. Sensitive personal answers have a separate explicit confirmation path.

## D05 — Acceptance unique per application
An arbitrary new client retry key cannot create a second acceptance. Timeout after durable acceptance goes to verification_required; retry checks status first. Changed answers cannot replace an accepted mock application.

## D06 — Local demo boundary
The published demo token is not authentication. Default execution binds loopback and uses synthetic data. Production identity, multi-tenancy, encryption/retention policies, deployment hardening and real adapters are outside scope.

## D07 — Release truth
Deterministic and API-backed results are reported separately. No configured API key means the live model demonstration gate remains incomplete. Mocked HTTP tests validate request handling but do not establish live provider compatibility or model quality.

## D08 — Recovery after process interruption
The staff reviewer challenged restart windows before and after mock acceptance. Both are now tested. An expired two-minute draft lease enables retry while revision checks discard late results. Local authoritative status-not-found permits idempotent mock submission; this is not a safe generic assumption for a real employer system.

## D09 — Council decision
Founder and AI reviews rated the discovery/AI evidence 6/10; staff rated the local implementation 8/10; hiring rated discussion readiness 7/10. These address different standards and are not averaged. We retain the bounded demo, disclose the missing live-model gate and unvalidated product need, and defer more features until a held-out comparison and real workflow research. Two new throughput/encryption probes expose answer-completeness limits despite exact quotations. They remain explicit known limitations rather than being folded into a perfect regression score.
