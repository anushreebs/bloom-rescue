# Bloom Rescue — UI redesign handoff

## What changed

An editable Figma design and a working frontend revision are delivered. The large introductory page has become a compact plum-and-ivory workspace: application queue, real-state progress, employer question, source evidence and answer editor. Source evidence precedes editing in reading order and on small screens. A horizontal mobile queue has a visible scroll hint and keyboard traversal tests.

The app uses native CSS/SVG motion: entry illustration, staggered queue cards, hover/focus feedback, request spinner, review-panel arrival and a receipt check. Motion does not fabricate model phases, percentages or employer acceptance. Reduced-motion preference disables animations and transitions. No new runtime dependency or remote font was added.

## Design and demonstration

- [Editable Figma](https://www.figma.com/design/FdVpjwTERGzduBV2WTQ2fC?node-id=3-340): three desktop states, mobile review and motion/accessibility specification. This is a design artifact, not a functional application.
- Actual local fictional workflow recording: `artifacts/ui-redesign/motion-demo.webm`. It shows review, approval, mock submission and timeout reconciliation. It is deterministic mode, not a live model or real employer application.
- Static fallback and desktop/mobile screenshots: `artifacts/ui-redesign/`. Earlier green UI images are preserved as before-desktop/before-mobile.
- Native Figma animation/prototype wiring could not be authored because the connected Starter-plan MCP quota was exhausted. The motion board is specification; the frontend recording demonstrates implemented motion.

## Verification

Five actual specialist agents handled UX direction, editable Figma, frontend implementation, independent performance/accessibility review and browser QA. The lead integrated findings and made a final semantic correction: an unsupported draft now shows **Evidence check / Missing evidence** with caution styling rather than a green evidence-complete cue. Sensitive questions show Human input needed. A regression test protects that distinction.

| Check | Final UI result | Scope |
|---|---|---|
| Component tests | 7 passed | Includes approval boundaries, uncertainty and missing-evidence progress |
| Browser suite | 8 passed; one opt-in recording test skipped in normal run | All five recovery workflows, four viewport widths, keyboard queue traversal, network recovery and reduced motion |
| Recording | Separate opt-in browser run | Actual local fictional workflow; not animated mock screenshots |
| QA axe | 10 scans, zero reported violations | Six original state scans and four responsive review scans |
| Production performance smoke | 6 viewport/motion conditions, zero axe violations, no page overflow, heading focus retained | Loopback Chromium, single sample per condition; not field data |
| Build and source checks | Production build/strict TypeScript, ESLint and formatting passed | Existing dependency lock retained |

## Measured payload and motion cost

Same Node gzip measurement method: original JS: 72,699 bytes; final JS: 74,321 bytes, an increase of 1,622 bytes (about 2.2%). CSS grows from 2,847 to 5,036 gzip bytes. Final JS remains below the project's 100 KiB budget. This is a payload comparison, not a claim of faster loading.

Final smoke sample: layout-shift sums approximately 0.000120 at 1440px, 0.008391 at 390px and 0.007940 at 320px. No long task over 50ms was observed in these short sessions. Reduced-motion sessions had zero elements with animation/transition styles. Raw results: `artifacts/ui-redesign/performance-final.json`; initial baseline preserved separately. These limited sessions do not establish 60fps, production Web Vitals or physical-mobile performance.

Independent review caught low-contrast progress labels and text-opacity entrance effects. Both were corrected before final browser checks. Loading placeholders reserve space. Full reports describe remaining density, mobile queue and accessibility tradeoffs.

## Install locally

Use `Bloom_Rescue_UI_Update.zip` and follow `UI_UPGRADE.md`; it overwrites frontend source/index only and preserves the backend and synthetic database. No new API key or credentials are needed. The complete updated source package is also provided.

The user’s Mac is not modified remotely. The previous UI remains there until the downloaded update is installed. Deterministic mode, API configuration and existing mock receipts behave as before. The UI work does not close the untested live-provider gate or establish business value.

## Remaining limits

Safari, Firefox, real screen readers, broad zoom/device coverage, delayed real-model calls and field performance remain untested. Figma and implementation share direction but are not claimed pixel-identical or fully synchronized. Existing backend safety/evaluation reports remain relevant; backend code was not changed in this UI revision. No real Bloom integration, authentication or employer submission was added.
