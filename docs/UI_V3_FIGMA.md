# Independent round 1 — Figma and design-system architect

## Evidence and scope

Read the complete user brief, current `frontend/src/styles.css`, state/labels in `App.tsx`, `docs/UI_FIGMA.md`, and `design/figma-state.json`. These are code/document observations, not a new usability study. Attempted one targeted metadata read of existing frame `3:340` in Figma file `FdVpjwTERGzduBV2WTQ2fC`. The tool returned “You've reached the Figma MCP tool call limit on the Starter plan.” No new canvas edits or screenshots are claimed, and no retries were made.

## Three important findings

1. **Observed design drift:** the existing Figma report specifies accent `#5B35A5` and canvas `#F6F5F8`; implementation uses `#4D285D` and `#F7F6F8`. Neither color is inherently wrong, but they no longer form a single shared source. Proposal: preserve the implementation's richer plum family, use explicit semantic light/dark tokens, and document the Figma delta rather than pretending it is synchronized. Verification: inspect both rendered themes and all state surfaces after implementation; sync editable Figma when quota permits.
2. **Observed fragmented foundations:** CSS has many literal colors and a late font-size patch using `!important`. This demonstrates maintenance cost in the stylesheet, not measured runtime slowness. Proposal: centralize semantic palette, type/spacing/motion tokens; replace color literals where feasible. Dark theme requires semantic state/background pairs rather than one global inversion. Unknown: visual contrast across final implemented combinations until scanned/calculated.
3. **Observed sound reusable structure:** queue cards, source rail, workflow progress, editor and outcomes already share stable classes and typed state labels. Preserve these. Design opportunity: define variants by truthful state rather than invent new backend steps. An approved answer uses review/approved styling; a mock-submitted receipt alone receives terminal success styling. Neither green appearance nor checkmark establishes real employer receipt.

## Foundations and reusable component specification

`design/V3_TOKENS.json` contains proposed semantic light/dark palette, typography ramp, 4px spacing scale, radii, layout, motion and component-variant vocabulary. These values are a design specification, not a statement that all have been implemented or passed contrast checks. Use one semantic variable name across CSS and future Figma variables; store both light and dark values in a single Figma collection with two modes.

| Component | Variants and constraints |
|---|---|
| QueueCard | Default, pointer hover, visible keyboard focus, selected, pending, submitted. Selected outline plus text preserves meaning without color. Keep full card button; no nested controls. |
| ActionButton | Primary, secondary, quiet, destructive; idle/loading/disabled. 44px minimum hit area. Loading retains meaningful verb and width. |
| StateBadge | Attention, processing, review, approved, uncertain, failed, mock-submitted. Text always visible; use source state, never animation completion, to choose variant. |
| EvidenceCard | Profile source, prior approved answer, no evidence, unverified. Exact source and quoted content remain readable. Decorative emphasis must not imply semantic verification. |
| AnswerEditor | Draft, edited, checking, error, approved/read-only. Preserve label and explanation; dirty edits visibly distinguished from original proposal. |
| OutcomePanel | Ready to resume, uncertain, mock submitted, failed. Only confirmed mock submission gets animated check; uncertainty is amber with reconcile action. |
| ThemeControl | Light/dark with accessible name and explicit current state. Persist preference locally; initial system preference is optional. |

Auto-layout: page vertical; desktop workspace horizontal with fixed queue and fill workspace; workspace question spans columns, editor/evidence nested horizontal; at 1150px stack evidence with editor, at 760px adapt queue to compact scrollable cards and one-column workspace. Use content-sized frames, 16–32px padding, 12–24px related spacing. Do not force long error copy into fixed heights. Desktop 1440, tablet 834, phone 390 and narrow 320 should be represented in future editable frames.

Typography: body 15px, supporting 13px, metadata 12px; avoid tiny labels as a premium styling device. Titles 20–32px with clear hierarchy. Inter retained without a new external font request. Focus ring is independent of selected outline.

Motion annotations: each component references token duration/easing plus event trigger, reduced-motion alternative, and cancellation on actual error. Figma transitions remain specifications until authored and inspected; runtime animation recordings establish implementation behavior only.

## Three directions, from this role's perspective

- **Calm Intelligence:** most coherent continuation; spacious readable evidence and quiet state emphasis. Main risk is empty-looking whitespace when queue is sparse.
- **Immersive Recovery:** expressive dimensional cards can show craft, but dark layered surfaces and animation multiply state variants and verification effort. Better used as restrained optional dark theme, not an entertainment browsing model.
- **Precision Workspace:** excellent basis for compact workflow, but excessive small labels conflict with legibility. Use its efficiency with Calm Intelligence's spacing, within one consistent component vocabulary.

Recommendation: Calm Intelligence foundation, compact workspace structure, carefully tokenized optional dark mode. These are expert design judgments; no comparative user task timing has established superiority.

## Counterargument and limits

A fresh palette/token hierarchy can consume effort without improving the recovery task, and existing CSS is small enough to maintain manually. Therefore migrate foundations only where implementation already changes; do not block functional delivery on a complete Figma library. Real user testing could favor greater density or a simpler light-only UI. No Figma V3 synchronization, native timeline creation, final contrast certification, or new runtime tests were performed by this role. Backend behavior is outside ownership.

Priority: must preserve truthful state variants; should centralize theme tokens and readable type; optional future complete editable component library. Architect approval requested for semantic token contract and light/dark mode scope before implementation.
