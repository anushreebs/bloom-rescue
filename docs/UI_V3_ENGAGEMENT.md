# Recovery queue engagement — independent first review

Owner: Specialist 4. Source inspection and existing screenshots only; no production edits or live user study. Reviewed the full V3 brief, `frontend/src/App.tsx`, `frontend/src/styles.css`, `frontend/src/types.ts`, and `artifacts/ui-redesign/review-1440.png`. Findings are independent of other V3 specialist conclusions.

## Three consequential findings

| Finding | Direct evidence | Consequence / interpretation | Recommendation | Confidence / limits |
|---|---|---|---|---|
| The summary calls every non-submitted application “to review,” including approved, submitting and uncertain states. | `App.tsx` queue-summary uses `state !== "submitted"`. The state map separately contains approved, submitting and verification_required. | **Verified content mismatch:** “to review” is not accurate for all counted states. It could encourage unnecessary review; that user consequence is inferred. | Label the count “open” or “not submitted.” Prefer “open” with a separate submitted count. | High on code/content mismatch; no observed user confusion. |
| Each card has a useful question preview and status, but the next-action caption is always “Open application.” | `App.tsx` application-list; screenshot shows identical captions for review-required and submitted cards. | **Design opportunity:** users must open a card to distinguish what they should do next. Question text is a requirement, not necessarily the known cause of interruption. | Derive truthful next-action copy from current state and available draft data, without starting an action on card click. For example “Review evidence →”, “Resume mock application →”, “Check submission status →”, “View mock receipt →”. | High on observed identical captions; benefit is a hypothesis. No time-to-task measurements. |
| Stable source order already preserves orientation; no filter is currently implemented. | `update()` replaces an item by ID via `.map`; rendering maps `apps` without sorting. Stable React keys use application ID. Mobile CSS creates a 230px horizontally scrollable rail. | **Strength worth preserving:** a state update does not move the user's target. A completed card remains available for its receipt. **Opportunity:** at larger queue sizes a user might want actionable-only filtering, but five examples do not establish that need. | Keep stable order and selected card visible after transitions. Do not auto-sort or auto-hide submitted items. Defer filters, or add a simple explicit “All / Open / Submitted” only if the visible five-card demonstration becomes materially easier to scan. | High on implementation; mobile touch usability and filter value not tested. |

## Approved-scope proposal

1. **State-derived card guidance (must fix summary, should improve cards).** Company/role first, requirement preview second, semantic state badge third, next-action text last. `interrupted`: “Review question”; `awaiting_review`: “Review answer” if usable draft, otherwise “Review missing information”; `approved`: “Resume mock application”; `submitting`: “View sending status”; `verification_required`: “Check submission status”; `submitted`: “View mock receipt”; `failed`: “Review and retry”. These are navigation labels, not new secondary submission buttons. They must not skip approval.
2. **Selection with restrained depth (should improve).** Keep strong border, left marker and `aria-current`; enhance using a small transform/soft shadow only. Do not shrink or dim neighboring cards enough to impair reading. A narrow visual state stripe can complement the text badge; no color-only categories. Avoid enlarging the selected card because it shifts every following card.
3. **Stable queue feedback (should improve).** Update the active card's badge and supporting next action in place after the server response. Keep the current workspace selected, retain the card in the list, and use the existing live status for outcome. A brief border/check transition may signal changed state without automatically advancing to the next application. No false urgency, “quick fix” times, success percentages or recovery rankings.

## Netflix reference translated to productivity

Borrow confident card hierarchy, strong selected-item identity, and contextual preview. Do not borrow autoplay, cinematic background imagery, hover-only facts, content carousels that bury tasks, or automatic promotion to a new item. These records are work to complete, not media to maximize browsing. With five small fictional companies, typography and state clarity offer more relevant craft than invented logos or thumbnails.

## Strongest counterargument

More copy can make compact cards heavier and duplicate the workspace CTA. Resolve this by replacing the generic “Open application” caption rather than adding another line. Keep the preview to two lines and the whole card a single semantic button. If adding a blocker label forces ambiguous inference, retain the question preview plus accurate state and action instead. Data only supports known states and deterministic source checks, not root-cause diagnosis or resolution difficulty.

## Verification / acceptance criteria

- Component tests map every supported state to truthful queue copy; open count includes approved/uncertain records without calling them review-required.
- On approve and submitted transitions, application order and selected ID remain unchanged.
- Submitted card stays keyboard reachable and opens receipt; missing-evidence card never offers instant resolution.
- Inspect 320px, tablet, desktop, reduced motion, long company/role/question strings. Selected card must remain identifiable without motion.
- Keyboard focus visible; one card tab stop; accessible name includes company, role and state; card click never directly submits.
- Compare screenshot scan clarity qualitatively, then use task-based testing to establish actual improvement. No claim of measured engagement/conversion uplift.

Tests performed in this role: static source review and existing screenshot inspection only. Interactive navigation, touch, performance and screen-reader behavior: **not tested** by this specialist.
