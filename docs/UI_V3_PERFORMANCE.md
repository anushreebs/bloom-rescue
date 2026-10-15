# V3 independent performance review

## First round, before other V3 conclusions

Evidence: current `frontend/src/App.tsx`, `styles.css`, package manifest, production build and actual Chromium run recorded in `artifacts/v3/performance-before.json`. Existing report was background only. No app code changed by this reviewer.

### Three important findings

1. **Observed: existing payload and motion are already modest.** Referenced production JS is 240,703 raw / 74,321 offline gzip bytes; CSS18,591 /5,036 bytes. Six local sessions (1440,390,320px; normal/reduced motion) recorded zero browser long tasks over50ms and no document overflow. Reduced-motion computed animation/transition counts are0/0. Preserve native CSS/SVG and no downloaded fonts. Do not introduce a general motion runtime for this bounded surface without demonstrating a specific unmet interaction.
2. **Design opportunity: dark mode does not itself require expensive graphics.** Current source uses small static shadows, transform/opacity entrance and border/shadow hover transitions; no backdrop-filter was found. Keep theme changes to color/surface tokens and an immediate or brief transition; avoid full-screen blur, animated shadows and continuous ambient effects. Dark-theme speed and rendering are not yet tested. Aesthetic improvement remains a design judgment.
3. **Observed architecture, unmeasured consequence: editing rerenders the parent workspace.** Answer state is in App; on each edit App reevaluates two five-item count filters and selected lookup, and renders its children. This is trivial fixture volume; it is not evidence of a bottleneck. Extract reusable components for maintainability if useful, but do not blanket memoize or claim performance gains without profiling. Proposed real-time character/source decoration should remain local and avoid per-keystroke network calls.

### Baseline conditions

Chromium153.0.8010.0, Linux, production build, loopback, no CPU/network throttling, one sample per condition. Initial navigation/select Fable Labs/draft. First condition generates draft; later ones read persisted draft. Static assets served uncompressed; gzip is offline compression, not transfer. Short-session layout shift sums:1440px0.000120;390px0.008391;320px0.007940 (same reduced/normal). These are not field CWV percentiles, official performance scores or a controlled before/after experiment.

### Decision requests

- Keep JS project budget100KiB gzip (a chosen local budget, not industry standard), no new animation library, local/system font.
- Reserve queue/loading space and avoid auto-reordering focused cards. Prefer selection border/transform to animated width/height or simultaneous card expansion.
- Retest both themes and reduced motion after final integration; do not label untested theme ready.
- Do not add artificial loading delays so an animation can finish; actual network state owns progress.

### Strongest counterargument

A well-selected motion library can simplify interruption, layout choreography and cleanup more than handwritten CSS. If genuinely needed, a measured bundle tradeoff is reasonable. This prototype currently has five cards and short transitions; no such requirement is demonstrated.

### Confidence / limits

High confidence in payload bytes and recorded synthetic conditions; medium in cost risks based on source; low in physical-mobile smoothness. Not tested: real mobile hardware, React profiler, field LCP/INP, sustained load, live LLM, full approval/submission performance, slow API or background-tab recovery. Zero observed long tasks does not establish60fps or good real-world INP. No measured business effect. Final after-measurement pending integration.

### Reproduce

From frontend after `npm run build`:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/bloom-chromium node ../scripts/ui-performance.mjs > ../artifacts/v3/performance-before.json
```

Linux fallback path applies only in this environment. Script uses ephemeral ports and disposable database, no port8000 or regular demo data.

## Implemented checkpoint — before final remediation

Actual12-condition production run is preserved in `artifacts/v3/performance-checkpoint.json`. Both light/dark OS preference,1440/390/320px,normal/reducedmotion. JS245,461raw/75,647gzip;CSS22,195raw/5,319gzip. All12conditions had0axeviolations, no horizontal overflow and heading focus retained. Reduced-motion styles were0/0. One1440px reduced-motion light run recorded54ms long task; no source attribution, so do not attribute it to rendering or theme.

**Verified issue reported to lead:**320px layout shift sum rose to0.202699 light/0.201245 dark versus baseline0.007940. Recorded rectangles show mode badge growing192→232px after health loads, pushing theme button to a third row and main content down41px. This is a bounded lab regression, not field CLS. Recommendation: stable initial mode-label footprint or deliberate reserved narrow header row. Other sampled shifts:1440~0.000270;3900.006090. All still synthetic single sessions. Final measurements pending that fix and busy-history integration.

## Final frozen production measurement

Final source hashes: JS`index-D9Qpu3vw.js`, CSS`index-rcSsQ7aZ.css`. Actual raw results: `artifacts/v3/performance-after.json`; harness `scripts/v3-performance.mjs`. Root implemented stable narrow-header layout after the checkpoint finding. Repeated complete12-condition run, same Chromium153 and disposable local deterministic backend, no app-source changes by this reviewer.

| Asset | Baseline raw/gzip bytes | Final raw/gzip bytes | Gzip change |
|---|---:|---:|---:|
| JavaScript |240,703 /74,321 |246,929 /75,993 |+1,672bytes (+2.25%) |
| CSS |18,591 /5,036 |22,681 /5,429 |+393bytes (+7.80%) |

The final JavaScript remains below the chosen100KiB gzip budget. Native CSS/SVG and local/system font preserve bounded dependency cost; this is a payload observation, not evidence of faster response.

| Theme | Viewport | Final observed shift sum (normal/reduced) | Long tasks >50ms (normal/reduced) |
|---|---|---:|---|
| Light |1440×1000 |0.000270 /0.000270 |none /none |
| Light |390×1000 |0.005927 /0.005927 |none /none |
| Light |320×1000 |0.004540 /0.004540 |none /none |
| Dark |1440×1000 |0.000271 /0.000271 |none /one66ms |
| Dark |390×1000 |0.005927 /0.005927 |none /none |
| Dark |320×1000 |0.004540 /0.004540 |none /none |

All12sessions: zero automated axe violations, no document horizontal overflow, review heading focus retained, no animations still running800ms after sampled display. All6reduced-motion sessions: computed element animation/transition counts0/0. The normal-motion style counts are8–9animated elements and8transition elements; these are style-presence counts, not concurrent animations or frame-rate measurements.

The320px shift regression from checkpoint0.201–0.203 fell to0.004540 after root's header fix; baseline light320px was0.007940. Recorded attribution makes the header correction credible within this lab scenario. It does not establish deployed CLS improvement across devices/users. Other baseline comparisons:390px0.008391→0.005927;1440px0.000120→~0.000270 (small increase). Dark had no original baseline, so do not call its result an improvement.

One66ms long task occurred in final1440px dark/reduced session (checkpoint had one54ms light/reduced). No call-stack attribution was collected. Could reflect browser/runner scheduling or app execution; do not diagnose from this result. In particular, do not claim zero long tasks, universal60fps, a good field INP or a verified CWV pass. No further source change justified by one unattributed sample; repeat throttled tracing on representative hardware before stronger claims.

### Final decision

No remaining blocking performance finding from this bounded check. Header shift defect was reported and remediated; no animation dependency introduced. Both themes preserve reduced-motion behavior in actual browser checks. Small payload increase buys theme, provenance and context-retention behavior while staying in budget. Approve as a local prototype with explicit limitations: one sample/condition, local unthrottled desktop Chromium, emulated narrow viewports, no physical-mobile GPU profiling, no sustained workload, no field LCP/INP, no live LLM path and no approval/submission timing in this harness. Separate QA covers functional workflows. Do not generalize zero axe violations into accessibility compliance.

## Release hash refresh after asynchronous-notice correction

The lead made a final notice-only correction and rebuilt. New shipped JS`index-DnBlLGyS.js`:247,045raw /76,018gzip bytes; CSS hash and sizes unchanged (`index-rcSsQ7aZ.css`,22,681raw /5,429gzip). Current JavaScript increase over baseline is1,697gzip bytes (+2.28%). These figures supersede the preceding freeze's exact JS figures.

Independent complete12-condition rerun on this final build is current `artifacts/v3/performance-after.json`. Previous run (including the66ms task) is preserved as `artifacts/v3/performance-pre-notice-fix.json`; earlier54ms sample remains in `performance-checkpoint.json`. Final repeat observed no >50ms tasks in any condition. Do not infer that the small notice fix eliminated long tasks: sparse timing varies between local runs and no causal profiling was done. Accurate cross-run statement: isolated54ms/66ms tasks occurred in prior checks, none in final repeat.

All other final results match prior freeze:12zero-violation axe scans; no document overflow; heading focus retained; all6reduced-motion conditions0animation/transition styles; no active animations after settle; shift sums1440light0.000270/dark0.000271,390both0.005927,320both0.004540. No new blocking finding. Existing synthetic-run, physical-device and field-metric limitations apply unchanged.
