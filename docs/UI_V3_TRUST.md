# V3 independent behavioral UX and trust review

Scope: source inspection of `frontend/src/App.tsx`, `WorkspaceVisuals.tsx`, shared V3 brief, user attachment and approved contracts. No new browser interaction or user research performed in this role. Findings below distinguish source-observed behavior from plausible consequences. No other V3 specialist findings were read before this review.

## Preserve

- Approval and mock submission are separate actions. Submitted outcome explicitly says local mock receipt, not employer confirmation.
- The ambiguous-timeout state says acceptance is uncertain and checks status before retrying. This is meaningful reassurance based on a recovery mechanism, rather than decorative confidence.
- Reuse is unchecked by default; revocation text explains that existing approvals and receipts remain. Keep this distinction visible near its control.

## Three key findings

| Priority | Finding and source-observed behavior | Consequence (inference) | Proposed change | Limitation / verification |
|---|---|---|---|---|
| Must fix | `act('resolve')` unconditionally announces “Draft ready for review” for any successful resolve response. Cloud/sensitive outcomes can contain no answer and require missing information. | A successful check could be mistaken for a usable answer, especially when accompanied by a positive reveal animation. | Derive completion notice from `next.state` and `next.draft.verdict`: supported → “Evidence draft ready for review”; sensitive → “Check finished. Enter and confirm your answer”; unsupported/needs_information → “Check finished. More information is needed.” Reserve success animation for actual supported answer or confirmed transition. | This is source-observed wording, not evidence of actual user confusion. Add component assertions for supported, unsupported, sensitive and failed results. |
| Should improve | Queue summary counts every state except `submitted` as “to review,” including approved, submitting and uncertain submission. Card state badge itself is accurate. | Summary can imply unnecessary review, weakening the approved/ready/uncertain distinctions. | Use neutral “open” for nonterminal count, or accurate “needs attention” grouping with state-specific card next actions. Retain submitted history and selection; do not auto-remove selected card after success. | No need for a new dashboard or filters for five cases. Test approved and uncertainty summaries against fixtures. |
| Must fix if claiming context preservation | `open(a)` resets editor to server-approved/draft answer; unsaved typed edits exist only in the single `answer` state. Selecting another card and returning discards them without warning. | Users may lose an eligibility answer or correction, reducing confidence that returning is safe. | Store transient edited text per application ID with its source revision. Switching preserves same-revision draft locally; a revision conflict must explicitly request rereview and not silently resurrect stale text. A narrow alternative is confirmation before discarding unsaved text. Do not imply persistence across refresh unless implemented. | Browser persistence not tested; source demonstrates per-selection reset. Add switch-away/back and changed-revision tests. Do not persist personal answers to localStorage merely for visual polish. |

## State message contract

Every active workspace should supply one concise contextual message addressing what happened, next action and consequence. Examples are proposals, not observed product outcomes:

- Interrupted: “This question needs an answer. Check available evidence; nothing will be submitted.”
- Supported draft: “A draft was assembled from the shown sources. Review it, then approve the answer.”
- Unsupported: “No supporting excerpt was found. This demo cannot approve a technical answer until evidence is available.”
- Sensitive: “This question needs your own answer. Enter fictional information and confirm it before approval.”
- Approved: “Your answer is approved and locked. Resume separately to send that exact answer to the mock ATS.”
- Uncertain submission: “A response was interrupted. The mock ATS may already have accepted it; check status before another attempt.”
- Submitted: “The mock ATS confirms one acceptance. This is not a real employer confirmation.”

Avoid numeric confidence, synthetic percentages, simulated reasoning steps, deadline pressure or implied external success. Spinner is acceptable for an outstanding request; text must say the real operation, not invented subtasks. Counts describe database states, not probability or completion quality.

## Repeated warnings and cognitive load

Observed: independent-demo boundary appears in header, intro and footer; source rail adds judgment note, main editor adds extractive caveat, technical helper, optional warnings and missing-information notice. These are truthful but can compete with the next action. Proposed: keep compact persistent “Independent demo · mock ATS” identity, exact receipt caveat at submission outcome, important evidence limitation adjacent to editor, and one consolidated state-specific problem notice. Move broader evaluation/affiliation qualifications to an accessible “About this demo” disclosure without concealing them. This is a design hypothesis; no research establishes that the current number of notices overloads actual users.

## Strongest counterargument

For a hiring-demo prototype, repeated caveats prevent overclaiming and backend-locked answers deliberately keep state simple. Local edit caching increases invalidation complexity, while most scripted demonstrations will never switch mid-edit. Therefore prioritize truthful result messages and counts first; implement transient caching only with revision-based invalidation tests, otherwise use a discard confirmation and accurately document the limitation.

Confidence: high for the three source behaviors; moderate for recommended prioritization; untested for perceived calmness, comprehension speed and business value. No claim of live-model quality, WCAG compliance or user preference is justified by this review.

Artifacts/tests: this document only; code inspected, no code edited or tests run by this role. Architect approval requested for state-derived messages, neutral queue summary and guarded in-memory context preservation. No backend change required.
