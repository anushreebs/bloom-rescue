# Accessibility specialist — independent first review

Scope: inspected `frontend/src/App.tsx`, `WorkspaceVisuals.tsx`, `styles.css` and existing Playwright suites. This first review is source-based, not a new browser execution. Existing scan reports are prior evidence, not independent confirmation. WCAG 2.2 AA is a target, not a compliance claim.

## Three key findings

1. **Preserve semantic controls, explicit state text and reduced motion.** Observed: queue actions are native buttons; editor has a label; progress is an ordered list with `aria-current`; errors use `role=alert`; notices use a persistent polite status region; decorative SVGs are hidden; CSS disables animations/transitions under reduced motion and forces the checkmark into its finished shape. Existing browser suites cover keyboard selection, 320px reflow and reduced-motion animations. Recommendation: keep this foundation and add dark-theme and form-error checks rather than replacing native elements with visual-only widgets. Limitation: browser assertions do not establish actual screen-reader announcement quality.

2. **Form error association needs a narrower model.** Observed: `aria-invalid={Boolean(error) && app.state === 'awaiting_review'}` marks the answer invalid for any error, including a history-fetch failure; the editor describes only `answer-help`, while the actual error is a separate global alert. Inference: a keyboard/screen-reader user may receive a misleading invalid-field signal or miss the specific correction on returning to the field. Alternative: global alert may announce adequately for some AT/browser combinations. Recommendation: separate answer-validation errors from operational errors, associate the exact answer error via an ID in `aria-describedby`, and keep the global alert for network/status failures. Verify unsupported-edit and sensitive-confirmation cases plus an unrelated operation failure. Must fix if editor validity remains misleading.

3. **New dark/theme and motion designs need release gates beyond axe.** Observed: current CSS has one light palette and several hard-coded light surfaces; no theme toggle or dark token mapping exists. Approval removes its triggering button and reveals a different next-action button without explicit post-action focus. This is a design opportunity, not demonstrated task failure. Recommendation: tokenise all semantic foreground/background pairs, test both themes in supported/missing/sensitive/uncertain states, provide target sizes of at least 24x24 CSS px with a 44px preferred interactive row, verify theme-toggle accessible name/pressed state, preserve focus predictably when controls disappear, and run 320px + text-resize/reduced-motion checks. Verify contrast in rendered contexts; avoid attributing readability solely to aesthetics. Should improve; newly introduced critical failures block release.

## Strongest counterargument

Extra focus movement after every asynchronous response can interrupt reading, and field-level error plumbing may add complexity to this small POC. Therefore retain stable focus where the triggering control persists; move it only when its removal would strand focus, and avoid stealing focus for background updates. Use the existing persistent status region instead of introducing multiple competing live regions.

## Limits / evidence that changes this review

No actual VoiceOver/NVDA, zoomed Safari, touch-device or dark-theme browser review performed in this first round. Native disclosure semantics and visible focus CSS exist but do not prove every focus ring is unobscured. Final automated tests will measure Chromium DOM behavior, axe output and CSS reduced-motion behavior; manual screen-reader and real-device checks remain explicitly not tested.

Artifacts: this report. New tests: not yet run (implementation pending). Architectural approval requested: error association and bounded focus recovery, theme token coverage, no backend changes.

## Lead execution checkpoint

The final combined QA suite executed the eleven accessibility cases and original responsive/state scans. Eight new light/dark supported/missing/sensitive/uncertain axe outputs contain zero reported violations; control-error association, reduced-motion/targets and approval-focus tests passed. QA total is30browser tests, including isolated transport fixtures; this is execution evidence from the combined run, not an actual screen-reader session. See UI_V3_QA.md and final-e2e.log.
