# Bloom Rescue approved implementation contracts

Lead architect draft, 14 October 2026. Independent fictional single-user demonstration; no Bloom integration, scraping or live applications. Root approves this bounded architecture for implementation; specialists may propose changes but must not silently change shared interfaces.

## Ownership
Product1 docs PRODUCT_SPEC USER_STORIES BUSINESS_HYPOTHESIS; UX2 docs UX_SPEC; React3 frontend/src and frontend tests; Backend4 backend/app/main.py db.py schemas.py seed.py and API tests; AI5 backend/app/ai.py and AI tests; Workflow6 backend/app/workflow.py ats.py and workflow tests; Security7 security tests/report; Performance8 scripts/benchmark.py and performance report; QA9 frontend/e2e and integration tests; Eval10 eval dataset/runner/report; DevOps11 manifests/config/CI/setup; Reviewer12 independent code review. Root integrates and resolves conflicts. No overlapping edits without messages.

## Files and runtime
Python FastAPI backend using sqlite3 standard library (lightweight persistence equivalent). app package under backend/app. React TypeScript Vite frontend. Backend port8000 frontend5173; frontend dev proxy /api strips /api. API token X-Demo-Token default local-demo-token (public demo boundary, NOT production auth). Bind localhost by default. Fictional candidate c-demo only; never trust candidate IDs from requests. CORS only configured localhost origins. No user profile upload or real PII.

## JSON contract
GET /health -> {status:'ok', mode:'deterministic'|'api'}.
GET /applications -> {applications: Application[]}.
Application fields: id, candidate_id, company, role, question, question_kind, state, revision (integer optimistic concurrency), evidence: Evidence[], draft: Resolution|null, approved_answer: string|null, receipt: object|null, scenario ('normal'|'ambiguous_timeout').
Evidence fields: id,candidate_id,kind ('profile'|'approved_answer'),topic,text,context (string). All fictional.
Resolution fields: answer:string, claims: Claim[], missing_information:string[], requires_confirmation:bool, verdict ('supported'|'needs_information'|'sensitive'|'unsupported'), mode ('deterministic'|'api'), latency_ms:float, tokens:int|null, warnings:string[]. Claim fields: text,source_id,quote.
POST /applications/{id}/resolve body {} -> Application. Must not overwrite approved/submitting/submitted data. Returns awaiting_review (or failed on provider failure); events record resolving and outcome.
POST /applications/{id}/approve body {revision:int,answer:string,consent_save:bool,confirm_sensitive:bool} -> Application. Exact current revision required; stale conflicts409. Requires nonempty answer and explicit sensitive confirmation. All technical factual edits must pass deterministic verification; unsupported claims422. Unknown/sensitive personal answer may be explicitly supplied by the human with confirmation; never silently inferred. No auto approval.
POST /applications/{id}/resume body {revision:int,idempotency_key:string} -> Application. Only approved can submit. Submitted or verification_required supports safe same-key repeat/reconcile. Different key must not cause a duplicate. Mock adapter uses application ID+approved revision/answer hash as stable logical identity. Timeout-after-accept -> verification_required, retry reconciles before any possible submission. Terminal submitted never resubmits.
GET /applications/{id}/events -> {events:[{id,application_id,type,from_state,to_state,created_at,detail:object}]}.
DELETE /answers/{id} revokes a consent-saved answer; does not silently revoke an existing approved application or employer receipt. GET /answers -> {answers:Evidence[]} for review/revocation. Optional POST /demo/reset only local token-protected fictional reset; do not expose in deployed production.
Errors shape {detail:string}; no raw provider exception or secrets in responses/logs.

## State and persistence
States interrupted,resolving,awaiting_review,approved,submitting,submitted,failed,verification_required. Pure workflow transition function transition(current,event)->new; event names resolve_start,resolve_success,resolve_error,approve,submit_start,submit_success,submit_timeout,reconcile_success,reconcile_pending. Validations handled before transition. SQLite transaction serialises resolve/approve/resume (local single-user); avoid transaction during slow network: backend use optimistic updates and compare revisions, discard late responses. Persist state/events/approved answer/consent/mock receipts. Idempotency unique for logical application, independent of arbitrary client retry key. No unbounded loops. Two provider attempts maximum with timeout. Verify status after ambiguous failures; do not blindly replay.

## AI functions owned by agent5
resolve_question(question:str,evidence:list[dict],question_kind:str='technical',mode:str|None=None)->dict Resolution. Also verify_answer(answer:str,claims:list[dict],evidence:list[dict])->tuple[bool,list[str]]. retrieve_evidence(question,evidence,question_kind='technical')->list[dict]. Provider configured via LLM_MODE,OPENAI_API_KEY,OPENAI_MODEL,OPENAI_BASE_URL; do not enable live transmission without explicit configuration. Actual mode returned from runtime. Use mock mode label 'deterministic', never simulated successful model API.
Safety-first extractive draft: each claim text must equal a verbatim evidence quote, source must exist for c-demo, quotes must occur in source and topic/context must match. Answer must consist only of verified claim texts joined by spaces/newlines, no additional factual clauses. Model uses strict JSON to select supported excerpts and identify missing info; server validates and composes final draft. This deliberately limits fluent paraphrase to make verification meaningful, not a claim of general entailment. Authorization, compensation and uncertain eligibility always need human-supplied/confirmed values; prompt injection is untrusted data and cannot modify policy. Contradictions -> needs_information.

## Workflow functions owned by agent6
transition(state:str,event:str)->str raises ValueError on illegal transition. is_sensitive(question_kind:str)->bool. MockATS class(db_path:str), submit(application_id:str,answer:str,logical_key:str,scenario:str='normal')->dict receipt, status(application_id:str,logical_key:str)->dict|None. Accepted receipt fields receipt_id,application_id,status:'submitted',submission_count:int. ambiguous_timeout scenario persists acceptance then raises AmbiguousSubmissionError; second call must reconcile via status. Adapter uses SQLite table separate from app state and survives restart. Define AmbiguousSubmissionError in ats.py. No production network adapter.

## Seed demo scenarios
Five applications a-rest (REST API supported), a-cloud (unsupported cloud deployment), a-auth (authorization human confirmation), a-reuse (same technical context approved answer retrieval), a-timeout (supported REST answer, ambiguous_timeout). Fictional companies only. Fixed evidence c-demo REST API project, testing experience, approved REST answer specific topic, no cloud/auth/salary facts. Root and eval use these IDs.

## Release truthfulness
Run deterministic evaluations independently; API live evaluation unavailable unless a key is configured. No key is currently configured. Do not mark the live API gate passed without executing it; report incomplete. Mock ATS receipts are not employer confirmations. No automatic approval. Accessibility is a tested subset toward WCAG2.2AA, not certified conformance. Product value remains a hypothesis.
