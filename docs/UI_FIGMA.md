# Bloom Rescue — editable Figma design

[Open the design file](https://www.figma.com/design/FdVpjwTERGzduBV2WTQ2fC?node-id=3-340)

Independent fictional prototype; this is not Bloom's production design or endorsement.

## Created and checked

| Frame | Node | Size | Purpose |
|---|---|---|---|
| Desktop · supported draft | 3:340 | 1440 × 990 | Evidence, answer, optional reuse and separate approval |
| Desktop · interrupted | 3:411 | 1440 × 887 | Initial blocking question and draft generation |
| Desktop · uncertain submission | 3:471 | 1440 × 887 | Amber uncertainty and reconcile-before-retry action |
| Mobile · supported draft | 3:533 | 390 × 1143 | Single-column answer review with readable controls |
| Motion & accessibility specification | 3:568 | 1440 × 616 | Six explicit motion behaviors and reduced-motion alternative |

The file contains 158 editable text nodes; surfaces, text and hierarchy are editable Figma layers. Buttons are linked Simple Design System component instances, not screenshots. Imported button labels are overridden. Brand colors are local variables bound to primitives; spacing and radius foundations are included. The source font was inspected and Inter retained.

Visual inspection: desktop and mobile screenshots were returned by the Figma tool and inspected. An initial auto-layout axis error clipped desktop content; it was fixed. The final desktop and mobile screenshots show readable content without clipping. These screenshots were visual design verification, not evidence of software behavior.

## Direction

Compact workspace; off-white canvas #F6F5F8, white panels, plum #5B35A5, ink #272336, muted #686175, border #DFDBE5. The final implementation may refine layout but should preserve clarity and the safety boundaries below. Coral #E9B8A0 is a decorative token, not a status signal.

272 px queue, central evidence/review panel and activity/safeguard rail at desktop widths; stacked/mobile detail view at narrow widths. 12 px surface radius and clear 14–16 px body text. Recovery work is above the fold instead of a marketing hero.

## Motion specification

- Queue hover: 160 ms color/border transition and optional 2 px pointer lift; no keyboard-focus movement.
- Review panel entrance: 220 ms opacity 0→1 and translateY 8→0; preserve focus on heading.
- Evidence: 240 ms entrance, 40 ms stagger capped at three cards. Never delay action availability.
- Mock receipt: 260 ms fade and scale .98→1; single playback, no confetti or auto-navigation.
- Uncertainty: immediate amber status and explicit next action. Never animate it as success.
- Reduced motion: no entrance transforms, stagger or decorative loops; preserve every text label.

**Native Figma timeline animation was not authored or verified.** The tool reported: “You've reached the Figma MCP tool call limit on the Starter plan.” This happened when checking native motion availability after the final static visuals passed inspection. The motion board is a specification; runtime animation must be demonstrated in the app. No animated Figma recording is claimed.

## Safety constraints

Keep actual mode label, fictional/mock boundary, evidence limitations, independent approve/submit decisions, opt-in consent and plain-language uncertain state. Never present unavailable evidence as absence of experience. Do not infer authorization or compensation. The activity rail in Figma is illustrative state content, not a live application audit log.

## Technical record

File key: FdVpjwTERGzduBV2WTQ2fC. Page: 0:1. Variable collection: VariableCollectionId:3:185. Construction script: design/build_figma.js (creation reference; do not rerun against an occupied file without checking IDs to avoid duplication). Layout was subsequently fixed in place as documented above. All frames are design proposals, not production test evidence.
