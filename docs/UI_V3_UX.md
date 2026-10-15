# Principal UX — independent first review

## Evidence and conditions

Source inspection of `frontend/src/App.tsx` and `WorkspaceVisuals.tsx`, plus existing `docs/UI_DELIVERY.md`. These are source-observed behaviors; no new user research or browser tests were performed in this review. Prior QA results are attributed to that report and do not establish usability. Three core experiences are already one coherent workspace, not separate required pages.

## Three consequential findings

| Finding | Evidence | Consequence / confidence | Proposed change |
|---|---|---|---|
| **Verified source behavior: switching applications discards unsaved local edits and checkbox choices.** | `open(a)` resets `answer` from approved/draft payload and resets consent/confirmation; there is only one answer state. `selected` is component state, not URL-backed. | A user editing sensitive information can lose work on card selection. Actual frequency is unknown. High confidence in code path, not observed user harm. Browser reload also loses unapproved edits; back does not restore selected application. | Preserve answer text in a per-application in-memory draft map. Leave consent/confirmation unchecked on return because those are decisions, not reusable text. Label unsaved edits honestly; explicitly say reload is not preserved. URL-backed selection with `replaceState` is optional; meaningful Back behavior requires intentional `pushState` and popstate handling/tests. Do not claim navigation persistence from selection animation. |
| **Verified semantic mismatch: every non-submitted item is counted as “to review.”** | Queue summary filters only `state !== submitted`; includes approved, submitting and verification_required. Cards include question and status, but every action label is “Open application.” | Queue conflates reviewing answers with checking an uncertain submission. Plausibly makes next action harder to scan; no timed user study. High confidence mismatch, medium consequence. | Use state-derived next-action text (“Review answer”, “Resume mock application”, “Check submission status”, “View receipt”) and precise summary “need attention” instead of “to review.” Add simple All / Needs attention / Submitted filters only if space allows; five items do not justify complex grouping or ranking. Keep current selection visible when its state changes, and show filter-empty explanation rather than disappearing silently. |
| **Design opportunity: status accuracy is strong but the main heading never changes with the task.** | Review heading stays “Review the blocking question” even for approved/submitted; approved and submitted outcomes correctly distinguish approval from submission; missing evidence is visibly cautioned in WorkflowProgress. Outcome appears after source/editor, even for terminal state. | Users can plausibly scan an outdated task heading before reaching the correct outcome below. No proof of confusion. Medium confidence. | Derive headline, explanation and immediate next action from server state. For approved/uncertain/submitted put compact outcome summary before locked answer details. Preserve source access and history, placing long technical detail in native disclosure. Never call approval “application recovered/submitted.” |

## Recommended bounded flow

1. **Queue — what happened:** company, question/category, precise state, next action. No invented urgency or “quick fix” time promises.
2. **Workspace — what now:** employer question; explicit state explanation; evidence beside editor; source vs editable text separated; one primary action for the current state. Keep approval and reuse distinct. Missing-evidence mode explains why approval is unavailable.
3. **Outcome — what next:** approved = ready for separate resume decision; uncertain = reconcile status; submitted = local mock receipt only. Show outcome before historical details. Preserve queue orientation and focus.

## Priority and acceptance

- **Must fix:** local text retention across application switching with regression test; no false refresh-persistence promise. An unsupported read-only draft is not saved as user edits.
- **Should improve:** state-derived headline/action labels and accurate attention counts, tested for all eight states.
- **Optional:** bounded queue filter and disclosure for history; test selected-item orientation and zero-result copy. Defer elaborate grouping/search for only five seeded items.

## Strongest counterargument

Per-application drafts and URL selection add state complexity to a five-scenario demo. A warning before switching would be cheaper and may be sufficient. Nevertheless, in-memory text retention is small and directly supports the user's requested “return to unfinished resolution”; persistent storage would add privacy and staleness concerns and is deliberately not proposed. Likewise, separate outcome screens could appear more cinematic but would create navigation complexity without demonstrated task benefit.

## What cannot be determined

No evidence establishes real users' preferred queue order, common blockers, completion times, confusion rate, need for dark mode, or preference among visual concepts. No real Bloom recovery failure is established. The safest direction is Calm Intelligence with Precision Workspace density: this is a design judgment, not empirical superiority. No production code edited and no tests claimed as run.
