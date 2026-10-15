# Final UX checkpoint

14 October 2026. Independent UX specialist review of `frontend/src/App.tsx`, `styles.css`, `docs/ACCESSIBILITY_REPORT.md` and four retained screenshots (`artifacts/screenshots/01-queue.png` through `04-mobile-320.png`). This checkpoint used source inspection and image inspection, not a new interactive browser session.

## What works

- Visible deterministic-mode and fictional-demo labels; submitted screen explicitly distinguishes a local mock receipt from employer confirmation.
- Evidence is shown beside the reviewed answer, with quoted source IDs and an explicit limit on extractive verification. Approval and submission remain separate actions; approved payloads are visibly locked.
- The ambiguous-timeout screenshot shows an uncertain status and **Check submission status**, rather than an unqualified success message or a blind resubmit.
- The 320-pixel screenshot presents readable stacked content without visible horizontal clipping. Unsupported cloud experience is not fabricated, and the disabled approval is accompanied by an explanatory warning.

## Findings and priority

| Priority | Observed source / image | Consequence and recommendation | Verification |
|---|---|---|---|
| P2 copy accuracy | Queue subtitle in App.tsx: “Five scenarios. Every action stays local.” Header also supports live model API mode. | In API mode fictional context can leave the machine; replace with “Five fictional scenarios. Mock submissions only.” This narrows the claim without affecting functionality. | Source check plus a mode-label rendering test. No live API transmission was tested here. |
| P2 usability follow-up | Mobile screenshot stacks all five queue cards before the selected review. Selection focuses the heading in source. | Long repeat navigation is plausible, not measured. A compact queue disclosure / Back to queue control could reduce scrolling while preserving context. Current focus behavior reduces the immediate opening cost. | Complete keyboard and mobile task execution before prioritizing a layout change. |
| P2 accessibility follow-up | Error is a global role=alert; textarea has aria-invalid but aria-describedby references only answer-help. | Associate applicable field errors with the input and distinguish checkbox confirmation errors from answer errors. Generic request errors should not automatically mark the editor invalid. | Trigger empty answer, missing confirmation, unsupported edit and network errors using keyboard and a screen reader. Not interactively tested in this checkpoint. |
| P3 clarity | Unsupported-cloud view retains reuse checkbox and a read-only empty answer field while approval is disabled. | Explain that the task is escalated, and consider hiding irrelevant reuse controls until an approvable answer exists. Current explicit warning prevents a false impression of successful completion. | Observe whether demo reviewers understand why this scenario stops; no usability study performed. |
| P3 presentation | Submitted and uncertain screenshots retain a visible “Skip to recovery workspace” link over the queue; CSS shows it only on focus. | This can be a legitimate keyboard focus state, not a proven defect. For employer-facing screenshots, capture after moving focus deliberately to the relevant heading; preserve an untouched screenshot for test evidence. | Recapture only if needed, without removing keyboard focus styles. |

## Accessibility evidence boundaries

The QA report records six axe scans with zero violations, partial skip-link/entry focus assertions, and one 320×812 reduced-motion layout check. Those are **reported results from the QA artifacts**, not tests rerun by this reviewer. They do not establish full keyboard task completion, screen-reader behavior, zoom reflow, full contrast coverage or WCAG 2.2 AA conformance. Those limitations are correctly disclosed in the accessibility report.

## Release judgment

No new observed P0/P1 interaction defect from this bounded source/image review. Correct the locality wording before packaging. Keep broader accessibility and mobile usability follow-ups explicitly incomplete. The unsupported cloud scenario is a safe stop/escalation demonstration, not a completed application recovery. The evidence does not establish user demand, measured recovery improvement, or any defect in Bloom's actual recovery implementation.

Lead disposition: locality copy changed to “Five fictional scenarios. Mock submissions only.” API data transmission remains explicitly documented; this is a wording fix, not a live-provider test.
