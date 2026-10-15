# Accessibility — challenge round

These answers challenge shared proposals after the independent first round. Static concept boards are illustrative only.

| Council question | Accessibility response |
|---|---|
| 1 Senior-level beauty? | A has credible hierarchy; polish is subjective and cannot establish engineering seniority. |
| 2 Distinctive? | Evidence paired with approval is more meaningful differentiation than a darker decorative surface. |
| 3 Blocked application immediate? | State-specific text helps; do not depend on badge color. Need rendered scan review. |
| 4 AI suggestion understood? | Source-selection label plus edited/approved provenance is stronger than generic AI branding. |
| 5 Evidence beside editor intuitive? | Keep evidence early in DOM and available on mobile; desktop visual reordering has a reading-order tradeoff worth documenting. |
| 6 Actions visible? | Require focusable next action and unobscured focus at 320px and enlarged text; aesthetics alone cannot establish this. |
| 7 Motion helps? | Brief state-linked transitions can preserve orientation; text must carry the same information. |
| 8 Excessive animations? | Do not replay receipt celebration on every application revisit or animate every keystroke. |
| 9 Genuinely fast? | Performance agent measurements decide; no accessibility inference from smooth static visuals. |
| 10 Trust outcome? | Exact mock submission wording and explicit uncertainty must remain visible and announced. |
| 11 Every state accessible? | Not established. Release requires targeted both-theme automated checks, keyboard/focus, errors, reduced motion and reflow; actual screen-reader testing remains unavailable. |
| 12 Maintainable? | Native controls and CSS tokens are manageable. Avoid a new widget library or multiple competing live regions. |

Strongest other proposal: field-specific validation and truthful verdict-specific feedback. Both address actual source behavior rather than aesthetic speculation.

Challenge: optional dark mode is not automatically a usability improvement. It doubles color-state combinations, and hard-coded surfaces can undermine contrast even when ordinary text passes. Ship only if all key states are scanned and token contrast is verified; otherwise keep light-only. Counterargument: the user explicitly requests both themes and accessible dark preference can matter. Therefore support the bounded two-token-set implementation, not a theme editor.

Tradeoff: session-only edited drafts improve navigation recovery but cannot persist reloads; storing personal answers in localStorage would add privacy costs. Keep session memory and disclose its lifetime. URL selection is acceptable if navigation does not steal focus on background updates.

Recommendation changed: endorse A with compact scanning, gated dark palette, field-level errors and bounded post-action focus. Do not endorse B's extra depth/blur. Weighted concept ratings from colleagues are design judgments, not accessibility evidence.

Planned tests: both themes in supported/missing/sensitive/uncertain states, reduced-motion CSS, keyboard activation/focus, exact error description, unrelated history error does not invalidate editor, 320px reflow. No VoiceOver/NVDA claim.
