# Bloom Rescue product specification

Independent fictional prototype · 14 October 2026 · not a Bloom integration or endorsed product.

## Problem and evidence boundary

The proposed user is a candidate whose automated application pauses for an employer-specific question. They need to understand what is missing, review a truthful answer and resume without accidentally submitting twice. This need is a **product hypothesis**, not an observed failure of Bloom's recovery workflow.

Source: `../../second_review/Current_Evidence.md`, authenticated desktop review dated 14 October 2026. N05 establishes that Bloom already has Needs You and Manual Apply Required queues. N06 establishes an application timeline, resume preview and recordings. N10 establishes submission notifications. Preserve those capabilities; a generic tracker, receipt or notification would duplicate inspected functionality. N08 establishes profile completion at 100% alongside an unanswered optional salary field; this does not prove incorrect completion logic or an actual blocked application. No live Needs You case was exercised. Bloom's real recovery implementation, interruption frequency, demand and internal architecture remain unknown.

Observed journey: profile/resume → job matches/preferences → application → submitting/submitted timeline and notification; Needs You/manual queues also exist. The prototype isolates the **hypothesized interrupted branch**: interrupted → evidence-backed draft → explicit review → approval → simulated submission or verification. It does not replace matching, tailoring, tracking or the real application engine.

## Smallest useful product

One fictional candidate, five fictional applications, local persistence and a simulated ATS. Three views: interrupted queue, answer review with evidence, recovery outcome with audit history. Structured LLM output is optional through explicit configuration; deterministic mode must be visibly labeled and runnable without credentials.

1. Classify a question and retrieve relevant profile or consented approved-answer evidence.
2. Produce an extractive, source-linked draft when the evidence supports an answer. Explain missing information otherwise.
3. Keep authorization, compensation and eligibility decisions with the human. Never infer these from location, education or employment history.
4. Require explicit approval before submitting; preserve edits, revision checks and actionable errors.
5. Save an approved answer only with unchecked-by-default consent, scope reuse to its context and allow revocation.
6. Resume through a mock ATS; reconcile ambiguous outcomes before retrying, with one logical submission per application.

The extractive verifier checks quotes and sources, not general semantic truth. Human-supplied facts must remain distinguishable from evidence-verified facts. An unsupported draft must not invent either positive experience or a claim that the candidate lacks experience.

## Required scenarios and observable acceptance

| Scenario | Candidate task | Acceptance |
|---|---|---|
| a-rest | Answer a REST experience question | Relevant evidence is visible; claims refer to valid sources; review is required; approval precedes mock submission. |
| a-cloud | Resolve a question with no supporting cloud evidence | No qualifications are generated; missing information is explicit; no automatic approval or submission. Lack of source evidence is not asserted as lack of actual experience. |
| a-auth | Supply work authorization | No eligibility is inferred; the candidate must explicitly enter/confirm the answer before approval. |
| a-reuse | Reuse a prior approved REST answer | Context-matched source is shown; no new unsupported fact appears; review remains required; storage/revocation are explicit. |
| a-timeout | Recover after timeout following acceptance | Outcome says verification required; retry checks receipt status; accepted mock submission count remains one, including after restart and a different client key. |

Across scenarios: stale approval returns a conflict without overwriting newer state; provider errors disclose failure without leaking secrets; refresh recovers persisted state; keyboard users can complete the review; mobile layout exposes the same required controls. Completion is based on executed tests, not this specification alone.

## Deferred work

Real Bloom or ATS integration, browser automation, candidate uploads, production authentication/multi-tenancy, resume generation, job search/matching, payments, autonomous approval, unrestricted paraphrase, semantic entailment claims, live employer confirmation and broad analytics infrastructure. No runtime multi-agent system is necessary: deterministic rules coordinate one bounded LLM call path.

## Delivery and product decision

Release a local demo only when critical safety/reliability tests pass. If a live LLM API cannot be executed, ship an explicitly incomplete live-integration gate rather than claiming completion. Prototype quality does not demonstrate adoption value. Before advocating production integration, observe consenting candidates resolving real interruptions and inspect the existing recovery workflow. Stop or change direction if Bloom already handles the same need well, interruptions are rare/unimportant, or evidence-linked review increases work without improving truthful completion.
