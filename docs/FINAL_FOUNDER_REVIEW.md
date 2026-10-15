# Independent final council: Startup Founder

14 October 2026. First-round critique, written without reading other final council reviews. Reviewed README, product/business specifications, engineering decisions, evaluation, QA and performance reports, and frontend action/state handling. Reported test outcomes below are attributed to their reports; this reviewer did not independently rerun those suites.

## Judgment

**Readiness: 6/10 as a founder-facing discovery prototype; not ready for a production adoption decision.** The implemented local recovery flow, explicit consent and uncertainty-safe mock submission make this more useful than a static concept. Clear disclosure of fictional data and incomplete live API use strengthens credibility. The score is a qualitative judgment, not a probability or an averaged release gate; no amount of demo polish establishes that Bloom needs this feature.

The strongest product choice is making human review and safe recovery central instead of adding another generic AI writing surface. The timeout-after-accept scenario demonstrates an important failure boundary. The unsupported-cloud case also exposes a real product tradeoff: refusing to invent qualifications is valuable, but a user still needs a route to finish.

## Three most important weaknesses

| Priority | Weakness and evidence | Concrete next improvement | What remains unknown |
|---|---|---|---|
| Must validate before adoption | The opportunity is unvalidated. PRODUCT_SPEC cites existing Needs You/manual queues; the source assessment never exercised a real interrupted recovery. A hypothetical better branch may duplicate an existing product. | With permission, observe the current recovery path and interview candidates who encountered interruptions. Categorize interruption causes and assess the manual-answer baseline before proposing integration. | Frequency, abandonment, existing workflow quality and whether recovery is a priority. |
| Must validate before positioning as AI value | Incremental LLM value is not demonstrated. README says live API was not executed. EVALUATION_REPORT reports a known-set deterministic regression of 35/35 after fixes, compared with a deliberately weak first-source baseline. | Run configured API mode on an untouched set and compare against the current deterministic selector plus a clear manual form. Evaluate answer adequacy, truthful completion, abstention, correction effort, latency and cost. Keep rules if they perform similarly. | Whether model generation improves usefulness enough to justify transmission, latency and operating expense. |
| Should improve after the safety boundary is preserved | Missing technical evidence currently stops recovery: ENGINEERING_DECISIONS D04 deliberately defers new-evidence ingestion. This is honest but leaves a central user task unfinished in a-cloud. | Add an explicit human-supplied evidence step, distinguishing unverified human attestation from profile-backed facts, with review and provenance. Alternatively, provide a clear manual handoff. Do not remove extraction checks merely to permit arbitrary generated claims. | How often this branch occurs, what evidence real integrations can accept and how much extra input users tolerate. |

## Counterargument and scope discipline

This is an internship prototype, not a funded production initiative. A complete user study, real ATS contract and production authorization would expand scope beyond the assignment. That is a reason to **present the limitation clearly**, not to build those systems now. The current deliverable can credibly demonstrate engineering reasoning while the business case remains unresolved. The next product step should be a bounded validation conversation/task experiment rather than adding more features.

## Missing evidence and decision

Missing: actual interrupted-user observation, comparative task experiment, live provider outputs/cost/latency, held-out model evaluation, internal adoption/dependency review and real employer reconciliation semantics. The existing business measurement plan is appropriate as a proposal, not proof of conversion or revenue gains. Local performance measurements do not predict operating cost at scale.

Recommend demonstrating the current deterministic prototype with these limits and the live gate marked incomplete. Do not describe it as production-ready or as fixing an established Bloom defect. If current Bloom recovery already solves the task well, retain the project as an independent reliability exercise or change focus rather than arguing for redundant adoption.
