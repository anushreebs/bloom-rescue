# Security and privacy threat model

Independent fictional single-user demonstration. This review does not assess Bloom, any real ATS, or production infrastructure.

## Assets and trust boundaries

Assets are fictional candidate evidence, approval and consent decisions, workflow revisions, mock submission receipts, and optional model API credentials. Browser input, application questions, evidence text, and model output are untrusted. The backend owns candidate identity (`c-demo`), transition policy, evidence verification, approval, and submission identity. A configured provider is a separate outbound data boundary.

The public `X-Demo-Token: local-demo-token` is a local demonstration guard, **not authentication**. Bind to loopback. Do not deploy this server on a public interface, store real resumes, or use it for real candidate records. Production use would require real identity, tenant authorization, encryption, retention, incident controls, and a separate security review.

## Threats and required controls

| Threat | Consequence | Required control | Verification |
|---|---|---|---|
| Missing or wrong demo token | Unintended local state access | Protect every state/evidence endpoint, including reset; health can be public | API tests for missing/wrong token |
| Client-supplied candidate ID / foreign evidence | Cross-candidate disclosure or incorrect answer | Fix identity server-side; reject unknown request fields; filter evidence and consent records by owner | Inject foreign records and inspect list/resolve/revoke |
| Prompt injection in question/evidence | Fabricated credentials or policy bypass | Treat text as data; deterministic verification and sensitive-category override outside model | Injection fixtures and AI red-team cases |
| Fabricated source or unsupported answer suffix | False application statement | Validate source ID, owner, quote, question context; final answer only verified claims | Invalid references, mismatched quote and added clause tests |
| Authorization/salary inferred automatically | Unwanted sensitive representation | No generated sensitive answer; require explicit human answer and confirmation | Reject approval without confirmation |
| Stale draft or racing provider response | Approval applies to wrong evidence | Revision checking and optimistic commit; do not hold DB transaction over network | Stale approval and late result tests |
| Replay or timeout after ATS acceptance | Duplicate application | Stable application/approved-answer identity; persistent unique receipt; reconcile before replay | Retry with same and different client keys; restart persistence |
| Silent answer retention | Unwanted future reuse | Consent defaults false; save only after explicit approval and consent; list/revoke | Compare saved answers before/after approval; revoke then retrieve |
| Revocation ambiguity | Belief already sent answer was recalled | Explain revocation affects future retrieval only; retain audit/receipt | UI/document inspection |
| Secret or sensitive value in errors/logs | Credential/candidate exposure | Generic safe errors; structured metadata only; no raw provider payloads | Controlled exception and log review |
| Cross-site requests / injection | Local data manipulation | Exact local CORS allowlist, token header; parameterized SQL; text-only rendering | Source review; HTML-like input test |
| Public deployment / dependency compromise | Demo guard mistaken for security | Loopback defaults; lock/constrain dependencies; no committed credentials | Config review and tracked-file secret scan |

## Scope and residual risk

No real PII upload, production authorization service, rate limiter, multi-tenant access control, external ATS, encryption-at-rest guarantee, or penetration test is included. Local processes and users can read the SQLite database and configured environment. A user who explicitly configures API mode authorizes transmission of the fictional selected evidence and question to that provider; retention there depends on the provider/account policy. Provider URLs must be trusted configuration, never request-controlled. The extractive verifier checks constrained support, not unrestricted semantic truth.

## Release blockers

P0: cross-candidate disclosure, automatic sensitive representation, fabricated claim accepted as verified, duplicate logical submission. P1: unprotected mutation endpoint, stale approval accepted, consent-free retention, leaked credential/provider payload, replay after ambiguous acceptance without reconciliation. Tests and final code review remain pending until implementation exists.
