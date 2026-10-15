# Bloom Rescue — Calm Intelligence UI delivery

## Recommendation and scope

The selected design is **Calm Intelligence**: readable plum-and-ivory foundations, a compact recovery queue, meaningful evidence space and restrained native motion. Light and dark themes share the same semantic system. The prototype remains independent, fictional and local; no real Bloom or employer integration was added.

The important improvement is preserving user understanding and control. Unapproved text survives application switching in this page session; generated excerpts, user edits and approved payloads are labelled separately. Missing evidence and personal confirmation receive accurate feedback. Approval and mock submission remain separate actions.

## Existing-product audit

Baseline checks ran before changes: production build, seven component tests, eight browser tests and the prior production performance harness. Source review established these issues; expected user consequences were hypotheses until the targeted regression tests:

| Verified issue or opportunity | Delivered response |
|---|---|
| Switching applications replaced unsaved text | Per-application, revision-aware in-memory buffers; refresh intentionally restores server data |
| Resolve always announced “Draft ready” | Supported, missing-information and sensitive outcomes now use distinct feedback |
| Generic errors marked the editor invalid | Field-specific errors are associated with the correct control; operational warnings remain separate |
| Supplemental history failure could misreport a successful action | Authoritative action success is retained; optional-detail failure is a warning |
| Back/Forward during pending work could affect the wrong workspace | Application-scoped feedback, busy presentation, answer updates and focus; delayed-action regressions |
| Non-submitted queue total said “to review” | Neutral “open” count and state-derived navigation guidance |
| Dark mode and theme tokens were absent | Semantic light/dark variables, explicit toggle and optional stored theme preference |
| Long content and loading labels could shift/overflow narrow layouts | Stable header columns, reserved loading space, shrinkable grid children and wrapping |

Preserved: source traceability, explicit human confirmation, opt-in reuse, revocation, mock receipts, uncertain-status reconciliation and reduced motion. No automatic reordering, invented confidence percentages, urgency, completion times or fake model reasoning was introduced.

## Three concepts and council decision

Actual editable static high-fidelity boards: `design/concepts.html`; rendered comparisons: `artifacts/v3/conceptA.png`, `conceptB.png`, `conceptC.png`. Each shows queue, workspace and a separately labelled proposed outcome. They are design proposals, not test recordings.

| Concept | Strength | Tradeoff | Subjective weighted judgment |
|---|---|---|---:|
| A — Calm Intelligence | Question/evidence hierarchy and deliberate whitespace | Can feel less dramatic in a short demo | 4.75/5 |
| B — Immersive Recovery | Expressive dark surfaces and depth | More emphasis competition; effects need justification | 4.35/5 |
| C — Precision Workspace | Fast scanning and compact tooling | Dense content needs careful mobile reflow | 4.30/5 |

Weights follow the brief: clarity 25%, visual quality 20%, trust 20%, motion 15%, performance 10%, accessibility 10%. Scores are the visual director's qualitative judgments, not measured usability or compliance. Critical failures override any weighted total.

Twelve actual specialist agents completed independent first reviews. UX, Motion, Performance, Accessibility and Red Team explicitly answered the twelve challenge questions before the lead decision. Agreement was not treated as additional evidence. A was selected for task hierarchy; compact navigation remains coherent with A. B's extra visual effects were deferred. Dark mode was included conditionally on contrast/reflow checks. Browser context was kept to allowlisted application IDs, with no router library or answer text in URLs. Complex grouping was deferred for five records. Reports retain counterarguments and remaining uncertainty.

## Implemented experiences and motion

**Recovery queue:** stable company cards, literal status, state-derived next step and accessible mobile traversal. Selection URL supports reload and Back/Forward without writing answers to browser storage.

**Resolution workspace:** question, evidence rail, exact excerpts, editable draft, origin labels, explicit approval and precise errors. A changed server revision invalidates the old local buffer and confirmations. Successful primary actions are not reclassified as failures when history cannot load.

**Recovery outcome:** approved answer is locked and ready for a separate resume decision; uncertainty remains amber and offers status reconciliation; submitted state displays only a local mock receipt. Existing receipts do not replay a new-success animation on revisit.

Six motion signatures are specified in `UI_V3_MOTION.md`: queue focus, evidence reveal, approval feedback, actual processing, confirmed outcome and context preservation. Runtime uses native CSS/SVG and semantic states. No runtime animation library, remote font or artificial operation delay was added. Reduced motion removes animated movement while retaining textual status and static outcome icons.

## Verification and measured limits

| Check | Final result | Evidence boundary |
|---|---|---|
| Component tests | **10 passed** | Includes provenance, draft retention and semantic state presentation |
| Browser suite | **30 passed; 2 optional captures skipped** | Original real-mock-backend flows plus isolated frontend fixtures; fixtures do not prove provider/ATS integration |
| Backend tests | **81 passed** | Unchanged backend rerun in the restored environment; one upstream testclient deprecation warning |
| QA accessibility outputs | **18 scans; zero reported violations** | Six original state scans, four responsive scans, eight theme/state fixtures; not actual screen-reader testing |
| Production smoke | **12 theme/viewport/motion conditions** | Zero axe violations, no page overflow, retained heading focus; single synthetic sample per condition |
| Build/checks | Build, strict TypeScript, ESLint and formatting passed | Dependency lock retained |

Same gzip method: JS grows from 74,321 to 76,018 bytes (+2.28%); CSS from 5,036 to 5,429 bytes. JS stays below the project's 100 KiB budget. The intermediate 320px header shift (~0.202) was fixed; final layout-shift sum is 0.004540 at 320px and 0.005927 at 390px. Final repeated sessions observed no long tasks, but earlier 54ms/66ms samples remain in the report and raw artifacts. Do not claim 60fps, field Core Web Vitals or universal jank-free behavior.

`artifacts/v3/final-e2e.log` records the final full run. Current production hashes and raw measurements are in `performance-after.json`. Earlier measurements and failures are retained. Thirteen actual screenshots and a 14.36-second, constant-viewport workflow recording show the fictional app; they are not a narrated hiring presentation or a live-model run.

## Design source and limitations

Current editable HTML concepts and implemented token exports are delivered. `design/V3_TOKENS.json` preserves the earlier proposal and includes actual variables exported from the shipped stylesheet. `WorkspaceVisuals.tsx` and the stylesheet supply reusable visual primitives and state variants.

The earlier [editable Figma file](https://www.figma.com/design/FdVpjwTERGzduBV2WTQ2fC?node-id=3-340) remains a prior checkpoint. A targeted access check confirmed connected-account quota exhaustion. **No new Figma synchronization, frames, native animation wiring or export is claimed for this revision.**

Remaining limits: no actual VoiceOver/NVDA, Safari/Firefox, physical-device or broad zoom study; no user preference/task-time experiment; no field performance or conversion measurement. App remains a large stateful component and could be decomposed further. Missing technical evidence still requires a future intake workflow. Live LLM evaluation remains incomplete without configured credentials; this UI work does not close that gate. These limits are separate from the passing local tests.

## Install and demonstrate

Use the updated `Bloom_Rescue_UI_Update.zip` with `UI_UPGRADE.md`. The frontend-only archive preserves backend, credentials, installed dependencies and synthetic database. No new key is needed. Your Mac is unchanged until you install it.

For a demo: show light/dark; edit a draft, switch away and return; compare the edited label with unchanged sources; approve explicitly; demonstrate uncertainty and reconciliation; show the test report. Explain one tradeoff rather than narrating every animation. Do not claim real employer acceptance, source truth, production readiness or unaided development.

## Deliverable index

Audit and role reviews: `docs/UI_V3_*`. Three concepts: `design/concepts.html` plus PNGs. Decision/weights: `UI_V3_DECISION.md` and visual review. Foundations: actual CSS exports in `V3_TOKENS.json`. Components/motion: source and motion specification. Current Figma limits: `UI_V3_FIGMA.md`. Desktop/tablet/mobile, errors, accessibility and performance: QA/accessibility/performance reports and raw artifacts. Before/after: prior `artifacts/ui-redesign/` and new `artifacts/v3/`. Full source and frontend-only update are supplied separately.
