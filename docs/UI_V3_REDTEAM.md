# Independent critical design review — iteration 3

Reviewed the shared brief and complete user attachment, `frontend/src/App.tsx`, `WorkspaceVisuals.tsx`, the delivered supported-draft screenshot, and prior bounded performance/accessibility report. Did not read any other iteration-3 reviewer conclusions. No runtime interaction or new accessibility/performance measurement was performed in this first round.

## Preserve

Separate approval and mock submission are explicit in code and the screenshot. Missing evidence already receives a different progress marker from a supported check. Source text sits beside the editor on desktop. Native motion, reduced-motion rules and the existing limited measurement report are stronger foundations than a new animation dependency. These should survive visual refinement.

## Three consequential findings

| Finding and classification | Direct evidence | Proposed change | Consequence and limit |
|---|---|---|---|
| Unsaved editing is discarded when selecting another application. Verified source behavior; user harm is inferred. | `open(a)` unconditionally calls `setAnswer(a.approved_answer ?? a.draft?.answer ?? "")`; textarea edits exist only in one `answer` state variable. | Keep per-application in-memory edit buffers; use dirty-state detection. Switching away and back should retain an unfinished answer. If storage is intentionally ephemeral, label it and do not imply refresh persistence. | Context-preservation animation cannot compensate for losing an edit. Actual user expectation has not been researched; direct browser reproduction should be added before release. |
| A successful request and a useful/supported answer share the same completion notice. Verified source behavior; perceived certainty is inferred. | After every resolve response, `act` uses "Draft ready for review." unless state is verification-required. Unsupported and sensitive verdicts are only distinguished farther inside the workspace. | Derive completion message from verdict: supported draft ready; missing evidence needs information; personal answer requires explicit human input. Keep progress labels truthful and never use resolved/success styling solely because HTTP returned successfully. | Existing missing-information warnings partly mitigate this. A stronger visual reveal must not overstate the status. Test unsupported, sensitive, failure and delayed responses, not just the attractive REST fixture. |
| Premium treatment risks increasing framing and ornament around a relatively small task. Design opportunity, not an established usability failure. | Delivered desktop screenshot: global header, large introductory headline, boundary paragraph, notice, workspace heading, progress, question heading precede answer. Source rail repeats explanatory framing around one short excerpt. | Select a calm precision direction: concise introduction, contextual next action, expandable secondary explanations, evidence always visible. Animate state change once; avoid queue auto-reordering during review, continuous decorative motion, and unnecessary modal navigation. Split presentation into focused components while preserving state ownership and API contract. | Extra explanation helps a first-time evaluator and protects fictional boundaries. Keep a short persistent fictional/mock label; move detailed research limitations to an accessible disclosure rather than deleting them. No task-time study supports a quantified benefit. |

## Strongest counterargument

This is a portfolio demo with only five fictional applications, not a proven high-volume operational product. Stronger visual expression can help communicate craftsmanship and orientation. A conservative design that merely compresses everything could become generic or obscure safeguards. Permit one signature evidence-reveal and a restrained confirmed-receipt moment, but require observable state triggers, reduced-motion equivalence and clear text outcomes.

## Release constraints and evidence limits

- Do not call screenshot beauty a measured senior-level quality result. It is a design judgment; actual user comprehension remains untested.
- Prior zero-violation axe scans and local payload sizes do not establish WCAG 2.2 AA conformance, screen-reader usability, smooth physical-mobile rendering or Core Web Vitals in deployment.
- Any ambiguous submission must remain uncertain until receipt reconciliation. Approval, blocker resolution and submission need distinct visuals and language.
- Preserve all five scenarios; no backend change, real integration or live-model claim is justified by this UI task.
- No need for a runtime animation library has yet been demonstrated. A dependency can still be justified by an interaction that native primitives cannot reasonably deliver.

Confidence: high for the two source-level state observations; moderate for prioritization and visual hierarchy; low for any adoption or task-time implication. Recommended must-fix: edit context and verdict-sensitive feedback. Should improve: hierarchy and component boundaries. Optional: additional decorative motion.

Tests/artifacts: this independent review document only. Root approval requested for the proposed frontend state-buffer and status-copy changes; implementation belongs to the frontend owner.
