# Bloom Rescue — workspace visual and motion direction

14 October 2026. Independent UX/visual review of `App.tsx`, `styles.css`, `types.ts`, `UX_SPEC.md` and approved contracts. This is design direction, not user-research evidence or measured usability improvement.

## Design decision

Build a calm, precise application workspace, with expressive details concentrated on selection, evidence and status changes. The existing large introductory section competes with the actual task. Bring the queue and review task into the first screen. Preserve the explicit fictional-data boundary, deterministic/API mode, human approval, uncertainty and source limitations.

The design hypothesis: clearer task hierarchy and connected feedback will make the recovery process easier to follow in a short demonstration. Validate through actual task completion and readability; visual sophistication alone does not prove adoption value.

## Visual system

| Token | Value | Use |
|---|---|---|
| Canvas | `#F6F5F8` | Quiet warm gray page |
| Surface | `#FFFFFF` | Review, queue, evidence cards |
| Ink | `#272336` | Headings and body |
| Muted ink | `#686175` | Supporting text, measured before release |
| Brand | `#5B35A5` | Primary actions, active selection |
| Brand pale | `#F0EAFB` | Selected card and evidence accents |
| Accent | `#E9B8A0` | Decorative warm highlight, not normal text |
| Border | `#DFDBE5` | Panel separation; stronger control border as needed |
| Success ink / surface | `#236344` / `#EDF7F0` | Mock submitted / approved state |
| Caution ink / surface | `#785018` / `#FFF6E8` | Missing information, uncertain status |
| Error ink / surface | `#963E40` / `#FFF0F0` | Failed requests and validation |
| Focus | `#6A35B5` | Three-pixel visible outline + offset |

Use a local/system sans font stack; no runtime font download dependency. Body 14–16px, line height 1.55; workspace h1 30–34px, review h2 23–26px, section h3 16px. Keep sentence case except a few compact metadata labels. Use 4/8px spacing increments, 12–16px radii, fine borders and sparse soft shadows. Do not make everything a floating card. Visual contrast values are candidates pending measurement, not a conformance assertion.

## Desktop hierarchy

1. **App header, 64px:** small brand mark, Bloom Rescue title, Independent concept subtitle, right aligned actual model-mode pill. A subdued fictional candidate avatar may be decorative and explicitly fictional. No dead profile/settings controls.
2. **Workspace heading:** eyebrow Recovery workspace, h1 Application recovery, one short sentence. Compact metadata chips may show queue totals from actual state. Do not invent speed/success/confidence metrics. Keep a single concise boundary sentence below this heading.
3. **Two-column workspace:** 280–300px queue and flexible review, 20–24px gap; container 1440px max with 28–40px gutters. At wide screens, the evidence/editor content may use a secondary grid only if text remains readable.
4. **Queue:** heading, actual count, compact scenario cards. Company initials or simple monograms, company/role, 2-line question, text status. Active card uses stable border width, brand tint and side indicator. An arrow is decorative, not a separate unnamed control.
5. **Review:** company context and status, functional 3-stage indicator Evidence → Approval → Mock submission, employer question block, draft/evidence content and next action. The progress indicator derives from persisted state; uncertain submission remains visibly uncertain, not green completed.
6. **Evidence:** citation cards with short source labels and selectable exact quotations. Put technical source context behind the existing disclosure. Evidence may appear beside the editor at ≥1200px; below that, evidence precedes the editor. Do not add a fake source count or generic AI verified badge.
7. **Answer editor:** distinct generous writing surface with persistent label, truthful help text, clear read-only style and separated opt-in consent. Primary action aligned within the card; confirmation and submission never merged.
8. **Outcome:** visually distinct receipt card, explicit mock label, single accepted submission count. Uncertainty panel keeps Check submission status prominent. Activity is a clean ordered timeline with real timestamps.
9. **Saved answer permissions:** secondary full-width panel below workspace, actual saved entries and revoke action. Never imply revocation retracts submitted data.

Empty review state should feel designed: a small geometric illustration made with CSS/SVG, concise heading, three process steps. Avoid stock imagery and animated background decoration.

## Motion choreography

| Trigger | Motion | Duration | Constraints |
|---|---|---|---|
| Initial workspace entry | Opacity + translateY 6–10px | 220ms ease-out | Once, no fake wait; content available immediately |
| Card hover/focus | TranslateY −1px + subtle border/shadow | 140ms | Hover only on fine pointer; keyboard gets focus ring |
| Queue selection | Brand indicator and panel fade-in | 160–200ms | No exit delay, no focus loss; disabled/busy rules preserved |
| Draft request pending | Small spinner beside real action label; 3 static evidence placeholders optional | 800ms rotation | Only while actual request pending; no fabricated progress percentages |
| Draft or outcome arrival | Opacity + translateY 6px | 180ms | Do not animate textarea contents or alter quotes |
| Step advancement | Opacity on current step marker | 160ms | Actual persisted state only; no auto advancement |
| Success receipt | One small check stroke or scale .96→1 | 240ms | No confetti or celebration implying employer acceptance |
| History addition | Opacity only | 160ms | Stable ordered layout; no replay on every render |

Prefer CSS transform/opacity transitions and small inline SVG icons. Do not introduce a motion framework solely for these effects. No parallax, mouse-follow effects, infinite gradient animation, bouncing buttons or animated blur. Do not set permanent `will-change` on many cards. Do not add arbitrary loading delays to make the demo theatrical. A real local request can finish almost instantly; that is acceptable.

`prefers-reduced-motion: reduce` must disable animations, transitions and smooth scrolling, retain plain loading labels and instantaneous state changes. Do not depend on animation to communicate state. A dark theme is deferred; one thoroughly checked theme is more useful than two incomplete ones.

## Responsive and interaction requirements

- At ≤900px, reduce queue width or stack before either task area becomes cramped. At ≤680px, single column, full-width actions, 16px gutters. Keep queue visible without forcing a horizontal carousel. Long IDs and receipt values wrap.
- No page-level horizontal overflow at 320px; preserve readable controls at 200% and 400% zoom.
- Keep existing accessible names, `#main`, `#answer`, `#review-title`, checkbox semantics, live status and role=alert. Preserve separate named actions and `aria-current` selection. Decorative icons are `aria-hidden`.
- Existing selection focus behavior should remain deliberate. Do not remount the editor on every keystroke or state refresh. Avoid `key` on broad app wrappers that resets consent or draft state.
- Keep source limitations near the evidence, with boundary copy in header/footer. De-emphasizing copy visually is not permission to delete consequential limitations.
- Do not introduce nonfunctional navigation, filters, notification buttons or avatar menus. Any new count or progress indicator must derive from available data.

## Figma representation

Create editable frames for (1) initial queue, (2) supported draft awaiting review, (3) uncertain mock submission and (4) mobile awaiting review. Use Auto Layout and reusable primitives: Button / Badge / Queue item / Evidence card / Input / Timeline event / Notice. Prototype connections represent the actual workflow and are labeled as design prototypes; unsupported cloud remains blocked. Annotate motion timings above. Reuse the selected visual tokens rather than designing a materially different Figma screen from the shipped code.

## Review acceptance

Must retain all five end-to-end scenarios and current regression selectors, unless tests are updated because visible structure legitimately changes. Compare before/after screenshots at desktop and 320px. Run build, TypeScript, component/browser tests, axe scans, keyboard traversal and reduced-motion checks. Measure production bundle and avoid additional runtime libraries unless a concrete need outweighs their cost. Record actual performance measurements with environment and repeat count. No claims of broad WCAG compliance, conversion gain or live-model validation arise from this UI work.

## Counterargument and remaining uncertainty

A denser workspace may make a first-time visitor miss the conceptual explanation. Keep one concise opening explanation and the staged empty state; validate whether a new reviewer can explain approval versus submission without help. The plum palette is an aesthetic direction, not a proven improvement over the existing green palette. Product safety, readability and truthful state display take precedence over animation quantity.
