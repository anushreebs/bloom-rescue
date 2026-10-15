# Business hypothesis and measurement plan

## What is known

The supplied review records existing Needs You/manual application queues (N05), status/resume/recording views (N06) and notifications (N10). N08 records Bloom's own copy describing unanswered salary questions as a reason for additional input; this is a vendor claim, not measured frequency. No real interrupted recovery was tested. No internal analytics, revenue, churn or customer interviews are available.

## Testable value hypothesis

If a meaningful share of candidates abandon consequential interrupted applications because they cannot quickly supply a trustworthy answer, evidence-linked review and safe resumption may increase truthful recovery and reduce manual effort. Earlier completed applications might improve activation; eventual paid conversion is a distant exploratory outcome, not an established effect. A prototype proves engineering choices, not willingness to adopt or revenue impact.

## Measurement definitions

| Measure | Definition and limitation |
|---|---|
| Primary: interrupted-application recovery rate | Unique eligible interrupted applications reaching confirmed submission within a predeclared observation window / all unique eligible interrupted applications assigned to that cohort. Count mock receipts only in demo results; never combine with employer submissions. Keep unresolved ambiguous outcomes in the denominator. |
| First completed application | Candidates with no prior completed application who reach their first confirmed submission / eligible new candidates assigned. Distinguish activation from acceptance/interview. |
| Manual interventions per application | Explicit candidate correction/confirmation/help actions per eligible application, with predefined event definitions. Necessary sensitive confirmations are not automatically waste. |
| Time to resolution | Time from interruption to confirmed outcome; report unresolved/censored cases separately and show distribution rather than only completed-case mean. |
| Eventual paid conversion | Assigned eligible candidates purchasing within a predeclared window; exploratory, highly confounded without randomization and sufficient observations. |
| Safety guardrails | Unsupported-claim acceptance, incorrect sensitive answers, duplicates, lost edits, unauthorized reuse and abandonment. One material safety defect can block expansion despite faster completion. |

## Privacy-conscious instrumentation proposal

Proposed events: interruption_detected, resolution_requested, resolution_completed, review_opened, approval_rejected, answer_approved, reuse_consented, consent_revoked, resume_requested, submission_uncertain, reconciliation_completed, submission_confirmed. Use opaque candidate/application IDs, question category, mode, state/revision, duration, safe outcome/reason codes and attempt counts. Do not log answer text, resumes, authorization values, provider credentials or raw prompts. Mock audit events demonstrate state transitions; they are not a deployed analytics pipeline. Retention/access policy requires internal approval before any real rollout.

## Experiments in order

1. **Discovery:** inspect the actual interrupted workflow with permission; sample consenting sessions and aggregate interruption causes. Establish frequency, baseline recovery and whether existing features already solve the need. If no material gap appears, stop integration and retain the POC as a portfolio demonstration.
2. **Task experiment:** compare current permitted workflow, a simple manual-answer form with clear explanation, and evidence-linked drafting on the same representative fictional tasks. Counterbalance order; compare truthful completion, time, corrections and comprehension. Include unsupported and sensitive cases. A faster incorrect answer is a failure. Recruit actual target users before generalizing beyond the prototype team.
3. **Controlled rollout only if justified:** randomize eligible consenting candidates, not each application, to reduce cross-condition answer-reuse contamination. Stratify by question category and retain assignment for intention-to-treat analysis. Predeclare primary window, minimum practically meaningful improvement, non-inferiority safety bounds, sample size/power from measured baseline and stopping rules. Do not invent a traffic-based sample size now.

## Decision rules

Continue only if discovery finds an unsolved recurring problem and the prototype matches or improves truthful task completion over the simple baseline without material safety regression. Change scope if review/clarity alone performs similarly: ship the simpler approach first. Stop a real rollout for a fabricated eligibility answer, cross-user leakage or duplicate accepted submission; investigate and retest before expansion. Do not claim statistically significant improvement from a handful of demo runs.

## Adoption costs and portfolio value

Adoption depends on real ATS permissions, reconciliation support, candidate consent, existing recovery architecture and operational ownership. The isolated prototype demonstrates React/Python integration, explicit state management, structured generation, retrieval boundaries, adversarial evaluation and honest measurement. It does not establish competitive advantage or an unmet market.
