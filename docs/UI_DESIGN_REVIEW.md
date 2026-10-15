# Independent final UX/design review

Reviewed source `frontend/src/App.tsx`, `WorkspaceVisuals.tsx`, relevant styles and rendered artifacts `review-320.png`, `review-1440.png`, `uncertain-desktop.png` on 14 October 2026. Static screenshot/code inspection only; this reviewer did not perform a screen-reader session, live user study or independent performance measurement. QA results belong to their separate reports.

## Observed strengths

- Desktop review now has a compact workspace heading, readable queue, employer question, editor and distinct source rail. The fictional-data boundary and actual deterministic-mode label remain visible. This is an observed layout change, not measured improvement in task speed.
- `SourceRail` precedes `review-body` in the DOM. At 320px the source context appears before the editor and the question and controls fit the captured width. Long page height is visible, but no cropped question or editor was observed in that capture.
- Uncertain submission is explicitly amber, states that mock acceptance may already have occurred and offers **Check submission status**. The third workflow stage remains current rather than completed; no terminal success receipt is shown in this uncertain screenshot.
- Consent remains optional and separate from approval. Read-only approved payload and mock-ATS limitations are retained. Source statements remain selectable text and raw source context uses a disclosure.

## Material issue escalated

The captured unsupported cloud review shows zero sources but a green **Evidence / Completed** step. `WorkflowProgress` derives that marker only from `awaiting_review`, without the evidence verdict. A reasonable interpretation is that evidence itself has been established. This is narrower than a backend bug: the evidence and missing-information panels correctly state the opposite.

Requested fix: name the stage **Evidence check** and distinguish a completed check from established evidence; show an explicit caution label such as **Missing evidence** for unsupported/needs-information drafts and **Confirmation needed** for sensitive drafts. Do not use a green evidence-success cue for those outcomes. Root owns release decision and implementation; verify updated source and refreshed screenshots before claiming this resolved.

## Accepted deviations and remaining tradeoffs

- The mobile queue is horizontally scrollable, with a visible instruction and partial next card. This differs from the initial stacked-list proposal. The explicit hint makes the interaction discoverable in the inspected capture; keyboard and touch traversal still require QA evidence. Do not claim one pattern is universally superior without user research.
- Desktop evidence is visually on the right although it occurs earlier in DOM order. This prioritizes source reading for keyboard/screen-reader order and mobile stacking; pointer users see the editor first on the left. Both are acceptable for this bounded prototype, but user testing could favor a different arrangement.
- The unsupported-cloud view repeats several related caution paragraphs and occupies substantial vertical space on mobile. All communicate distinct limitations, so removing them casually would weaken accuracy. A future concise grouped notice could reduce repetition while retaining the distinctions; optional, not a release blocker.
- The generic queue total **to review** includes all non-submitted states, including approved/uncertain submissions. Consider **in progress** if this label creates confusion in walkthroughs; the actual state badges remain explicit. No incorrect numeric total was inferred from this naming issue.
- The uncertainty screenshot contains a visible skip link because it was captured in a focused state. That is appropriate focus behavior, not a persistent overlay defect. A presentation-only screenshot may be recaptured unfocused, without hiding keyboard affordances in the product.

## Confidence and limits

High confidence in the cited source-to-screenshot observations. Moderate confidence in perceived hierarchy; no real participant task data supports a usability-gain claim. Motion legibility, reduced-motion operation, keyboard traversal, contrast values, browser tests and performance must be evidenced by their respective QA/performance reports. Current review does not establish full accessibility conformance, live-model quality, adoption value or real Bloom integration.

## Lead resolution

The material progress issue is fixed: first stage is Evidence check; unsupported/needs-information drafts show amber Missing evidence, sensitive drafts Human input needed, and a finished supported check says Check finished. Verdict-aware component regression added. Final suite:7componenttests and8browsertests passed. Refreshed screenshots and raw axe outputs correspond to this change. No real user comprehension claim is made.
