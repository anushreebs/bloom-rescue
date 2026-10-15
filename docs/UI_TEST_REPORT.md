# UI redesign verification

## Scope and outcome

Final frozen frontend: **8 browser tests passed in 17.9 seconds**, with one opt-in recording test intentionally skipped during the normal suite. A separate fresh-backend recording run passed its single test in 11.3 seconds. QA preserved `frontend/e2e/recovery.spec.ts` unchanged and added `frontend/e2e/ui-redesign.spec.ts`.

Environment: Linux, Chromium 153 supplied at `/tmp/bloom-chromium`, Vite development server, deterministic evidence mode, FastAPI backend and a fresh isolated fictional SQLite database for each run. These are local prototype results, not tests of Bloom's production product or live model calls.

## Checks and observed results

| Check | Result and scope |
|---|---|
| All five original recovery scenarios | Passed: supported evidence approval and submission, unsupported cloud abstention, sensitive-answer confirmation, prior answer reuse, timeout reconciliation |
| Unsupported edit | Rejected before approval; original suite checks error and then submits supported text |
| Consent and revocation | Optional save is initially unchecked; revocation survives refresh without undoing submitted state |
| Duplicate safety | Timeout reconciles to one mock acceptance; retry with a different client key remains one acceptance |
| Network failure | Visible failure and Retry loading recover after the route is restored |
| Responsive reflow | No page-level horizontal overflow at 1440×1000, 768×1024, 390×844 and 320×812 |
| Console and JavaScript errors | Zero collected in the four responsive queue-to-review tests |
| Automated accessibility | Zero axe violations in four added review-state scans. Original suite also saved six scans; its assertions reject serious/critical violations. All ten final scan files contain zero violations |
| Keyboard focus | Skip link works; card activation moves focus to the review heading; at 320px, Tab traverses all five horizontal queue cards and scrolls the final card fully into view |
| Reduced motion | With reduce preference, no nontrivial decorative animation duration remains; keyboard and state content remain usable |
| Motion audit timing | Added viewport scans await finite Web Animations completion, without arbitrary test sleeps. Original workflow assertions remained unchanged |

## Issues found and fixed

The first browser pass failed six tests because contrast checks found muted progress labels below 4.5:1 and entrance fades temporarily weakened text contrast. Frontend darkened inactive progress and eyebrow text and changed text-container entrance motion to translation only. A subsequent full run passed, and the final frozen semantic/layout version was verified again.

The narrow queue uses a horizontal scroller rather than stacking every card. This saves vertical space but can hide later cards; a visible scroll hint and tested keyboard auto-scroll reduce that tradeoff. Human discoverability is not established by these tests.

## Visual evidence

`artifacts/ui-redesign/` contains:

- `queue-desktop.png`: initial fictional queue and empty workspace.
- `supported-draft-desktop.png`: actual supported draft with source rail and approval action.
- `uncertain-desktop.png`: actual ambiguous mock submission before reconciliation.
- `review-1440.png`, `review-768.png`, `review-390.png`, `review-320.png`: actual unsupported review state at four viewports.
- `axe-1440.json`, `axe-768.json`, `axe-390.json`, `axe-320.json`: viewport scan evidence.
- `motion-demo.webm`: 9.68-second actual browser capture of fictional REST drafting, separate approval/submission, then ambiguous timeout and reconciliation. No network interception or simulated UI was used in this recording; it runs deterministic mode against the mock ATS.
- `motion-static.png`: static fallback frame extracted from that recording at 2.5 seconds.
- Before images are retained separately as `before-desktop.png` and `before-mobile.png`.

QA visually inspected desktop supported draft, mobile reflow and an extracted video frame for clipping and legibility. Video is a short silent motion demonstration, not a narrated product walkthrough. Recording-only pauses aid readability; no product delay was introduced.

Caption: **Actual independent fictional demo, deterministic mode. Draft → human approval → mock submission; uncertain submission is reconciled before retry. No real employer integration.**

## Reproduce

From `frontend/`, with dependencies installed:

```bash
npm run e2e
UI_RECORD_DEMO=1 npm run e2e -- --grep 'motion recording'
```

This environment used `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/bloom-chromium` before those commands. A normal local installation can use Playwright-installed Chromium. Video capture requires Playwright's FFmpeg runtime (`npx playwright install ffmpeg` if not already present). The recording must be run separately against the fresh backend started by the test config; normal tests leave some applications submitted.

## Limitations

Automated axe and bounded keyboard checks do not establish full accessibility compliance. No screen-reader, Safari, Firefox, touch-device hardware, browser zoom or manual contrast audit was performed in this pass. No claims about production performance, user task-completion gains, conversion, actual model reliability or business value follow from these UI tests. The product still needs user validation and live-provider evaluation separately.

## Lead final semantic checkpoint

Verdict-aware progress avoids a green evidence-success cue for missing information. Componenttests now7passed. The unchanged browser suite plus responsive suite passed8tests in17.8seconds; opt-in recording skipped in that normal run. A fresh recording is produced separately against the same source.

The final recording rerun after the semantic correction passed separately in11.4seconds. The delivered WebM and supported/uncertain screenshots were regenerated from that source.
