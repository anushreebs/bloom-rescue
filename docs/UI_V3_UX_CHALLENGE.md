# UX challenge round

Reviewed round-one council synthesis and actual static concept HTML after completing independent review. No production edits or new behavioral tests.

## Explicit challenge questions

1. **Senior-level beauty?** A provides an intentional warm hierarchy; static boards cannot establish craftsmanship alone. Handling draft loss, focus, failures and responsiveness is stronger evidence than surface styling.
2. **Distinctive?** Plum/ivory source-beside-answer composition is coherent. None of three boards establishes competitive uniqueness; do not promise that.
3. **Blocked application identifiable?** Current status badges help, but “to review” miscounts approved/uncertain. State-derived attention/action labels address an actual source mismatch.
4. **AI suggestion understood?** Excerpt labels and sources are present. Add generated/edited/approved provenance and verdict-specific notices; avoid calling blank sensitive/unsupported results “draft ready.”
5. **Evidence beside editor intuitive?** Reasonable hypothesis, not proven usability. Concept boards reverse current source-first DOM reading order; implementation should preserve accessible source access while showing editor prominence.
6. **Actions visible?** Existing state-specific buttons work, but outcome sits after source/editor. State-driven summary near question is justified; avoid duplicating two competing primary buttons.
7. **Motion improves understanding?** Selection and outcome changes can preserve context. Only testing can establish benefit; no fake analysis stages.
8. **Any excess?** Replaying a success check on revisiting a receipt suggests new completion. Animate newly confirmed receipt only; static check on revisit.
9. **Genuinely fast?** Prior measured payload/smoke data are useful but limited. Require new before/after conditions; no inference of field speed from aesthetics.
10. **Trustworthy outcome?** Current mock labels are good. Fix supplemental-history failure being reported as failed primary action; mutation result must survive ancillary errors.
11. **Every state accessible?** Not established. Outcome focus after action removal, dark-theme contrast, reduced motion and semantic field errors need tests. No visual score overrides failures.
12. **Maintainable?** Small derived display helpers, in-memory text map and native CSS are bounded. Router, diff engine and large motion dependency are unnecessary for this scope.

## Strongest other proposal

Trust/AI review's separation of mutation success from ancillary history failures is stronger than additional decorative work: `act()` wraps action, history and saved answers in one try/catch, so a secondary fetch can present failure after an approved/submitted mutation. Preserve authoritative updated state and show secondary warning independently. This changes my ordering: fix trust feedback alongside text retention before layout polish.

## Challenge to a weak proposal

URL-backed navigation is useful but not automatically worth implementation. One workspace and five cards do not justify routing infrastructure. If implemented, use tiny application-ID URL state with allowlisted IDs, meaningful Back/Forward behavior, no answer text in URL, and tests for initial load, invalid ID, popstate and busy action. Otherwise explicitly defer; do not partially change URLs and claim working browser navigation.

## Tradeoff and final recommendation

Choose A as the primary direction, using C's compact queue only within A's typography/spacing language. B can inform optional dark tokens, but dimensional motion should not be the default stress-recovery experience. This is design judgment, not user-research proof. Static concepts hide the queue below 800px; that cannot transfer into production without an explicit accessible queue chooser. Retain the tested mobile queue/visible scroll hint until a measured improvement is available.

Support revision-aware in-memory drafts; confirmation remains an explicit action, not durable consent. Reopening the same revision may retain text, but a new server revision must not silently restore stale edits. Scope dark mode after primary trust/functional fixes and require semantic contrast checks. No need for complex filters, ranking or “quick recovery” claims with five seeded applications.

Recommendation changed in ordering and precision, not direction: trust feedback, safe text retention, truthful state summaries first; A-led polish and state-keyed motion second; URL navigation/theme only with bounded implementation and verification. Remaining uncertainty: no task study shows which direction users prefer or whether filtering improves completion speed.
