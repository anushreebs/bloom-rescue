# Motion director — challenge round

Inputs: independent reports as synthesized in `UI_V3_COUNCIL_ROUND1.md`, three editable static boards in `design/concepts.html`, and my source audit. Boards are not observed runtime behavior.

| Council question | Motion response |
|---|---|
| 1. Beautiful enough for senior frontend craftsmanship? | Calm A has a credible visual foundation. Senior craftsmanship must be demonstrated through resilient state changes, keyboard behavior and measured performance; a static board cannot establish it. |
| 2. Distinctive rather than generic? | Plum/ivory and evidence-next-to-answer are more distinctive when motion connects the actual source and decision. Generic floating particles or typing simulation would weaken that relationship. |
| 3. Identify blocked application immediately? | Current badges/question previews help. Adopt state-specific next actions; do not rely on pulsing or dim other cards below readable contrast. |
| 4. Understand the AI suggestion? | Verdict-specific notices and generated/edited provenance are stronger than a reveal effect. Animation cannot repair unsupported “Draft ready” wording. |
| 5. Evidence beside editor intuitive? | Plausible, supported by layout adjacency, not user-tested. Reveal both promptly without hiding evidence until a timed sequence finishes. |
| 6. Important actions visible? | Buttons already follow returned states. Maintain contrast, in-flow placement and immediate availability; no motion delay before resume or retry becomes usable. |
| 7. Motion improves understanding? | Selection and response-to-result transitions have a defensible orientation purpose. Benefit remains a hypothesis pending interaction testing. |
| 8. Excessive animation? | Current welcome illustration takes up to 850 ms including delay. Shorten or simplify; keep signature receipt at 420 ms maximum and only for a newly observed confirmation. Reject continual gradients, bounce and queue reshuffle. |
| 9. Genuinely fast? | Unknown from boards and code inspection. Avoid artificial wait, no animation library, bounded opacity/transforms; require actual build payload and browser measurement. |
| 10. Trustworthy outcome? | Backend-returned approved vs submitted vs uncertain states must govern icon and language. A green mock receipt cannot imply employer acknowledgement. Replaying a receipt celebration on revisit blurs new confirmation with stored state. |
| 11. Every state accessible? | Not established. Current reduced-motion static state is sound. New transitions need keyboard and axe verification; assistive technology needs actual testing, not a motion-spec assertion. |
| 12. Maintainable? | Yes if small CSS tokens and state/keyed presentational surfaces; no remounting the controlled editor, per-frame React state, or introduction of an animation runtime. Navigation and draft buffers deserve tests because they add more risk than the animations. |

## Strongest other proposal

UX's revision-aware, session-only draft buffers and verdict-specific notices are the most important proposals. Preserving a user's work is prerequisite to a reassuring transition. A polished slide that discards text is worse than an instant correct switch. Support these before adding visual choreography; ensure revision changes invalidate stale drafts and authorization/consent checkboxes do not silently carry to another application.

## Challenge and tradeoff

Challenge the appeal of Immersive B as the primary direction. Dimensional layering and dark gradients may photograph well but do not establish faster comprehension. They increase contrast/painting/theme verification obligations for an evidence-reading task. Use A with coherent compact cards, and permit a separately tested dark palette only without B's ornamental effects. The strongest argument for B is portfolio differentiation; counter it with a polished causal transition and a convincing failure-recovery demo rather than spectacle.

Receipt revisit disagreement: a stored receipt should show a complete static icon. Animate only after a successful returned response establishes the new receipt. An in-memory seen-ID set alone is insufficient on initial load: initialize observed receipt IDs from fetched submitted applications, or use an explicit justConfirmedReceiptId set by the successful action handler. Refresh must not celebrate old success. This intentionally sacrifices a recurring delightful moment to preserve temporal meaning.

## Recommendation change

My motion system remains native CSS with no library. I now explicitly prioritize draft preservation and truthful field/global feedback ahead of selection animation, based on the independently surfaced functional issues. Recommend A as the primary direction. Adopt the proposed URL-backed selection only with focus/back/forward tests; motion itself does not require routing complexity. Keep mobile queue readable and keyboard reachable regardless of whether it is horizontal or stacked.

## Confidence and remaining checks

High confidence in implementation constraints, moderate design confidence, no claim of measured usability or runtime smoothness. Required checks: reduced-motion selection and static check; stale receipt revisit; fast resolve without artificial wait; delayed and rejected requests; draft switching/restoration; mobile queue focus visibility; no remount-induced caret/focus loss. No production files edited by this role.
