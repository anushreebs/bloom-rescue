# UI redesign performance and accessibility review

## Scope and method

Independent reviewer inspected the existing `App.tsx`, `styles.css`, package manifest, prior performance report and production build. The UI implementer owns the redesign; this review adds only this document and `scripts/ui-performance.mjs`.

Measurements use the packaged Chromium 153 binary on Linux, production `dist`, a disposable SQLite database, local HTTP, deterministic drafting and no CPU/network throttling. Each viewport/motion combination is sampled once. Static files are served uncompressed; asset gzip sizes are offline compression measurements, not observed transfer sizes. The script starts its own ephemeral ports and never changes the regular demo database.

Reproduce after `npm run build`, from `frontend`:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/bloom-chromium node ../scripts/ui-performance.mjs > /tmp/bloom-ui-measurement.json
```

On a Mac with Playwright Chromium installed, omit `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. The `/tmp` executable is only this Linux environment's fallback.

Script scope is initial navigation, selecting Fable Labs and showing its draft. First condition generates the draft; subsequent contexts read that persisted draft. Heading focus, document overflow, browser PerformanceObserver long tasks/layout shifts, running animations and axe WCAG 2 A/AA + 2.1 AA rules are recorded. Draft generation differences mean these conditions should not be treated as an interaction benchmark comparison. The script does not exercise approval/submission; the separate E2E suite does.

## Existing build baseline, before redesign

Only assets referenced by `dist/index.html` are counted; an extra unreferenced JS file was excluded.

| Asset | Raw bytes | Offline gzip bytes |
|---|---:|---:|
| JavaScript | 235,804 | 72,699 |
| CSS | 9,077 | 2,847 |

| Viewport | Motion | Observed layout shift sum | Long tasks >50ms | Horizontal overflow | Heading focused | Axe violations |
|---|---|---:|---:|---|---|---:|
| 1440 × 1000 | Normal | 0.000148 | 0 | No | Yes | 0 |
| 1440 × 1000 | Reduced | 0.000148 | 0 | No | Yes | 0 |
| 390 × 1000 | Normal | 0.210992 | 0 | No | Yes | 0 |
| 390 × 1000 | Reduced | 0.210992 | 0 | No | Yes | 0 |
| 320 × 1000 | Normal | 0.169200 | 0 | No | Yes | 0 |
| 320 × 1000 | Reduced | 0.169200 | 0 | No | Yes | 0 |

The layout shift sum excludes shifts marked as recent user input, as exposed by Chromium. This short synthetic session is not a field Core Web Vitals result, a percentile or evidence of all-session stability. Mobile movement merits attention: asynchronous queue/saved-answer insertion is a plausible cause, but source-level attribution was not recorded. The recommendation to reserve loading space was sent to the implementer.

## Review priorities supplied before implementation

1. Use transform/opacity for entrance and selection motion. Do not animate layout geometry, continuously blurred backgrounds or mouse-follow effects. Avoid a runtime motion dependency without a functional need.
2. Reduced-motion rules must disable **animations and transitions**, preserve a plain pending-state label, and avoid infinite shimmer. The old stylesheet disabled transitions only.
3. Keep visible focus, named controls, current heading focus transfer and separate approval/submission. Preserve all five safety scenarios; visual changes must not imply employer acceptance.
4. Reserve initial loading space where possible. Maintain no horizontal overflow at 320px and avoid a horizontally scrolling queue.
5. Target total first-party JS below 100 KiB gzip for this bounded workspace; keep this a project budget, not an industry standard or proof of responsiveness.

## Limitations

Zero axe violations is limited automated evidence, not WCAG conformance. No screen-reader session, physical mobile device, assistive-switch testing, field traffic, CPU-throttled trace, React profiler, real LLM response or slow/hung provider trace is covered. Browser timings on local deterministic fixtures do not predict deployed performance. Palette attractiveness and motion preference remain design judgments, not measured user benefits.

## Redesign checkpoint

Measured the final stable production build, assets `index-OdsvGyer.js` and `index-HNceeSIo.css`, after fixes. Browser: Chromium 153.0.8010.0. Raw output is produced by the command above. A second repeat after adding explicit motion-style checks produced the same layout shift sums and no axe violations.

| Asset | Raw bytes | Offline gzip bytes | Difference from baseline gzip |
|---|---:|---:|---:|
| JavaScript | 240,305 | 74,206 | +1,507 |
| CSS | 17,868 | 4,884 | +2,037 |

Node zlib settings used by this script differ from Vite's displayed estimate; do not mix those numbers in a before/after comparison. The extra UI and native SVG/CSS motion remain below the proposed 100 KiB first-party JS budget. No runtime animation library or downloaded font was added. This is a payload-cost observation, not a speedup claim.

| Viewport | Motion | Layout shift sum | Long tasks >50ms | Overflow | Heading focus | Axe violations | Elements with animation / transition styles |
|---|---|---:|---:|---|---|---:|---|
| 1440 × 1000 | Normal | 0.000120 | 0 | No | Yes | 0 | 10 / 8 |
| 1440 × 1000 | Reduced | 0.000120 | 0 | No | Yes | 0 | 0 / 0 |
| 390 × 1000 | Normal | 0 | 0 | No | Yes | 0 | 9 / 8 |
| 390 × 1000 | Reduced | 0 | 0 | No | Yes | 0 | 0 / 0 |
| 320 × 1000 | Normal | 0 | 0 | No | Yes | 0 | 9 / 8 |
| 320 × 1000 | Reduced | 0 | 0 | No | Yes | 0 | 0 / 0 |

No animations were still running 800ms after the sampled draft display in any condition. The computed-style counts above additionally verify that reduced-motion mode removes animation and transition styles rather than merely allowing them to finish. A global rule also covers pseudo-elements by source inspection; the counts cover actual elements only.

The observed mobile shift sums are lower in these short final sessions than the baseline. Loading space is now reserved with nonanimated skeleton cards, but this is not a controlled causal experiment, a field percentile or proof of a universal stability improvement. Timings depend on local scheduling. Trace attribution was added to the script; final mobile sessions recorded no qualifying shifts to attribute.

### Issues found and resolved during independent review

- Initial redesign progress labels used `#817587` on `#fdfcfe`, measured by axe at 4.25:1, below the applicable 4.5:1 criterion. Reported to the UI owner; labels were darkened. Final six scans have zero reported violations.
- Initial entry animation could fade text and cause transient low contrast during QA. The implementer removed opacity animation from text-bearing entrance groups. Decorative illustration still uses opacity/transform, and the receipt check uses stroke animation. Shadows/borders transition on small controls, so not every style is compositor-only.
- Reduced motion initially needed stronger coverage. Final browser computed styles confirm zero animation/transition elements in all three reduced-motion viewports; the completion check remains visible by explicit stroke-dashoffset rule.
- Small helper/progress labels were enlarged by the implementer. Their readability remains a human-review concern beyond automated contrast testing.

### Mobile navigation tradeoff

The shipped mobile queue is an internally horizontal-scrolling row of cards, whereas the initial UX direction preferred a stacked queue. This keeps the review task closer to the first screen and avoids five vertically stacked cards. Page-level overflow remains absent, and buttons retain semantics, but discovery of off-screen queue items needs human validation. A horizontal queue is not itself evidence of usability improvement; this tradeoff was raised to the lead.

### Decision

No release-blocking finding remains from this bounded performance/accessibility check. Keep the 100 KiB JS budget, all existing regression tests and reduced-motion coverage. Before making stronger performance or accessibility claims, add throttled physical-mobile/screen-reader sessions and a delayed API scenario. No adoption or conversion gain has been measured.

## Final integration rerun

After the final semantic/reading-order changes the lead reran the same script. Raw final data is packaged at artifacts/ui-redesign/performance-final.json. Current JS240,703bytes/74,321gzip; CSS18,591bytes/5,036gzip. Six conditions again reported0axeviolations,0observedlongtasks,nooverflow andheadingfocusretained. Layout-shift sums:1440px0.000120,390px0.008391,320px0.007940 (samevaluesnormal/reduced). Reducedmotion styles0/0. These replace the earlier checkpoint's exact asset figures and mobile0shift observations for the delivered build. Small differences across runs are not a causal optimization result.
