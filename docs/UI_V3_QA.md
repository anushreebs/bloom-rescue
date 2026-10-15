# UI V3 independent QA review

## First-round findings (before other V3 reviews)

1. **Preserve the existing functional boundary. Observed in browser tests:** the eight original browser tests passed in Chromium using `/tmp/bloom-chromium` (17.4 seconds total); the optional recording test was skipped. This exercises five fictional scenarios, unsupported edit rejection, consent/revocation, sensitive confirmation, one-acceptance timeout reconciliation, initial-load error retry, keyboard entry, reduced motion, and 1440/768/390/320px layouts. It does not establish that every state is accessible or that real providers/employers work.
2. **Unapproved edits are not retained when navigating applications. Observed source:** `frontend/src/App.tsx` stores a single `answer` string, and `open(a)` resets it from the server draft/approved answer. Consequence is inferred: users may lose edits while comparing sources/applications. Proposed V3 acceptance criterion: retain buffers by application ID in session memory, clearly label unsaved edits, and do not imply durable server storage. Browser back should select prior application if URL history is introduced. Must test before claiming fixed.
3. **Missing coverage needs targeted tests. Observed suite/source:** no original dark-theme tests, delayed resolve request test, request-failure editor retention test, or browser-history restoration test. Proposed additions: one real-backend journey for navigation/refresh/approval persistence plus route-controlled loading/failure tests and long content reflow. Mocked transport/fixture tests must be labeled distinctly from real-backend results.

## Counterargument

A browser-history/session-buffer mechanism adds state complexity to a deliberately bounded demo. A clear discard warning would be an acceptable smaller alternative. The requirement is preventing silent loss, not mandating durable drafts or a router library.

## Confidence and limitations

High confidence in the original suite result and inspected React state behavior; moderate confidence in inferred user consequence, since no user research was performed. VoiceOver/NVDA, Safari, physical mobile hardware, live LLM/network behavior and external ATS were not tested. Long-description fixtures can test rendering but do not prove actual employer content ingestion.

## Actual artifacts

- Original browser screenshots and axe JSON are refreshed under `artifacts/screenshots`, `artifacts/axe`, and `artifacts/ui-redesign`.
- Static concept screenshots were rendered directly from `design/concepts.html`: `artifacts/v3/conceptA.png`, `conceptB.png`, `conceptC.png`. They are illustrative design explorations, not application test recordings. Their labels distinguish the separate illustrative outcome.

## V3 verification

Pending implementation. Do not interpret this section as passing V3 tests.

## Challenge round

The approved Calm Intelligence direction is coherent with evidence review, but a static board cannot establish task success. Dark mode broadens the test matrix and should be withheld if critical contrast or focus failures remain. I support memory-only edit retention with explicit reload limitations; durable storage would introduce privacy and correctness obligations beyond this UI iteration. History-based application selection is useful only if Back/Forward does not reset the user's edits or leave focus on the wrong card. Additional animations should not remount the editor or create false evidence-completion signals. The definitive release comparison is original workflow regression plus targeted new-state tests, not subjective concept scores.

Nine new isolated frontend transport-fixture cases are authored in `frontend/e2e/v3-workflows.spec.ts`. Execution is pending the implementation freeze and shared-port scheduling. They do not exercise real provider calls or employer integration.

## First V3 execution, 15 October UTC

Reconstructed the transient Python venv from pinned backend requirements and extracted Chromium via the committed browser-preparation script. The complete then-current suite ran with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/bloom-chromium npm run e2e`: **25 passed, 3 failed, 1 optional recording skipped** (1.4 minutes).

- Original eight regressions passed; all eleven new accessibility-specialist cases passed.
- Verified product failure: the synthetic long-question fixture (30 repeated sentences plus a 180-character unbroken token) caused horizontal overflow at 768px. Root notified; no product code changed by QA.
- Corrected two QA fixture errors: delayed resolve had incorrectly returned a null draft; the consent test tried to select an approval checkbox in a resolving state that intentionally hides approval controls. The revised consent case uses an approval conflict (HTTP409) to trigger server revision refresh.
- Added a regression for a delayed approval response arriving after browser Back changes the active application; assertions prohibit showing the previous application's success as the current application's outcome.
- Added an assertion that history-fetch failure cannot be presented as a known empty activity history.

Final regression and capture remain pending root's integration fixes. Earlier failures are retained here for traceability; they are not hidden by a later passing result.

## Final frozen-source verification

The first frozen-source rerun passed **29 tests, 2 optional recording tests skipped** in 46.8 seconds. Root then fixed a related stale-refresh notice after browser Back; a targeted regression was added. The final complete run passed **30 tests, 2 optional recording tests skipped** in **44.9 seconds**, using Linux headless Chromium with `/tmp/bloom-chromium`. Raw output: `artifacts/v3/final-e2e.log`.

Breakdown: eight original deterministic real-backend/browser regressions, eleven accessibility-specialist frontend cases, and eleven isolated transport-fixture workflow cases. Fixture cases establish UI behavior under controlled responses; they do not demonstrate actual provider latency, live LLM failure recovery, or external ATS integration. The final long-content fixture passes at 1440, 768, 390 and 320px in both themes, including a 180-character unbroken token.

Eighteen automated axe scans report **zero violations** in their tested conditions: six original workflow scans, four responsive workspace scans, eight light/dark supported/unsupported/sensitive/uncertain fixtures. The original scan assertions reject serious/critical violations, but examination of all saved JSON confirms zero of any severity. Locations: `artifacts/axe`, `artifacts/ui-redesign/axe-*.json`, `artifacts/ui-v3/accessibility`. No VoiceOver, NVDA, Safari, physical mobile hardware, or comprehensive WCAG conformance assessment was performed.

The browser-navigation tests confirm in-memory edits survive A-B-A and Back/Forward, while reload deliberately restores the server draft. An approval409 refresh clears old reuse consent. Background approval and refresh responses cannot claim success or leave a stale running notice on a different active application. Optional history failure is a warning, not a failed approval or known-empty history.

## Captured proof

The optional actual-workflow capture runs independently against a freshly seeded local deterministic backend. It shows draft generation, explicit approval, mock receipt, ambiguous timeout and reconciliation. The recording is un-narrated motion proof, not a user study, live-model demonstration, or employer submission. The capture assertions passed. The thirteen PNGs under `artifacts/v3` cover queue, draft and uncertainty in light/dark desktop/mobile conditions plus a light desktop mock receipt. Mobile screenshots are captured in separate nonrecording browser contexts so the desktop recording keeps a consistent viewport.

Concept A/B/C PNGs were rerendered from the current `design/concepts.html`, including Concept B's outer caption contrast correction. These remain static illustrative design proposals. Final actual screenshots were visually checked for readability, clipping and misleading state labels; final video was checked using ffprobe and sampled frame contact sheets. The persistent fictional-demo/mode boundaries and separate approval/submission states remain visible. No sensitive real user data was used.

Final capture verification: exit0 and Playwright `.last-run.json` status `passed`, no failed tests. The final named WebM is **14.36 seconds at1440×1100**, decoded successfully by ffprobe/ffmpeg. Sampled frames confirm a constant desktop viewport without the earlier mobile-resize padding. Raw capture log and a machine-readable QA summary are `artifacts/v3/capture-final.log` and `artifacts/v3/qa-summary.json`. The recording is short workflow/motion proof; screenshots carry readable static detail.
