# Visual director — independent first review

## Evidence and scope
Read `UI_V3_BRIEF.md`, the full user attachment, `frontend/src/styles.css`, `App.tsx`, and visually inspected `artifacts/ui-redesign/supported-draft-desktop.png`. This is a visual/source review, not a user study or new performance/accessibility test. `design/concepts.html` contains three actual editable, static high-fidelity design boards. Each shows queue, workspace and a separately labelled approved outcome preview. They depict proposed design with real fictional seed content; they do not establish implemented behavior.

## Three key findings
1. **Observed:** screenshot contains eyebrow, brand subtitle, mode pill, boundary copy, notice banner, queue instructions, counts, company eyebrow, heading, badge, steps and question eyebrow before the answer. **Design opportunity:** reduce repeated hierarchy, keep important boundary/mode labels legible, make question and next action carry visual weight. Consequence of overload is plausible, not measured. A user study could find these explanations helpful initially.
2. **Observed:** source rail is considerably narrower than editor; source text wraps early, with repeated rationale below it. **Design opportunity:** allocate a meaningful share of workspace to evidence, align evidence quote with answer and avoid decorative illustrations occupying scarce width. Longer genuine evidence may require more space than our short fixture.
3. **Observed:** existing source has supporting sizes at .61–.66rem and screenshot includes several tiny muted labels. **Opportunity:** use readable 12–14px supporting hierarchy and 16px body where space permits; reserve 11px solely for nonessential identifiers. Contrast and visual comfort require rendered testing; typography preference is not itself WCAG failure.

## Preserved strengths
Plum identity; warm neutral light surfaces; clear approval/submission separation; evidence beside answer; visible demo label; no stock imagery, distracting dashboard counts or unsupported confidence percentages.

## Concepts and comparative judgment
Ratings use 1–5 as subjective design judgments, not measured usability/accessibility/performance scores. Weighting follows the user brief. A critical release defect overrides any rating.

| Dimension | Weight | A Calm | B Immersive | C Precision | Rationale |
|---|---:|---:|---:|---:|---|
| Clarity |25%|5|4|4|A reserves most space for question/evidence; C scans quickly but compact text needs care.|
| Premium visual quality |20%|5|5|4|A deliberate whitespace; B expressive tonal depth; C more tool-like.|
| Trust/state accuracy |20%|5|4|5|A/C quiet hierarchy suits sensitive review; B effects risk distracting from state. All labels remain literal.|
| Motion potential |15%|4|5|4|B provides strongest depth cues, A restrained emphasis, C quick transitions. Static boards do not validate motion.|
| Performance potential |10%|5|4|5|All CSS-only; B larger shadows/gradient need measurement. Not a measured speed ranking.|
| Accessibility potential |10%|4|4|4|All require automated plus manual testing; high score does not imply compliance.|
| Weighted judgment |100%|4.75|4.35|4.30|Arithmetic of subjective ratings only.|

Additional comparison: A implementation cost low-to-medium because current layout already aligns; B medium with theme and dimensional states; C low-to-medium but dense reflow risk. A differentiation relies on editorial pacing and source/answer relationship rather than decorative novelty. B looks most expressive, C most familiar to technical tools. These are preferences/hypotheses.

## Recommended primary direction
**A Calm Intelligence**, implemented as a coherent warm-light workspace, with compact queue consistent with A's typography; optional dark theme uses B's palette without its extra dimensional effects. Do not casually merge three competing surface languages. Retain existing plum and choose one surface radius scale.

Tokens: light background `#F7F4F0`, surface `#FFFDFA`, ink `#302737`, muted `#716777`, line `#E6DFE5`, accent `#5B3266`, accent-soft `#EFE8F0`. Dark background `#17131C`, surface `#211B28`, ink `#F5EEF7`, muted `#C0B2CA`, line `#3D3047`, accent `#DAB8EB`, on-accent `#302038`. Semantic success/warning/error tokens must be tested independently in both themes and accompanied by literal text/icons. Radius8/12/18; spacing4/8/12/16/24/32/48; system fonts without external requests. Large heading32–40, section22–26, body14–16, support12–14. Avoid ornamental all-caps as primary reading text.

## Strongest counterargument
The user explicitly wants visual drama. B may communicate stronger craftsmanship in a short hiring demo. But a productivity recovery flow is a risky place for motion and dimensional card prominence; the technical demo should demonstrate attention management, evidence traceability and truthful outcomes. A can still be memorable through typography and precise choreography. A preference test with target users or an observed dull/flat final render could change this recommendation.

## Limits / tests
Created static HTML with responsive CSS, no runtime dependency. Source inspection and one screenshot review only. No claim of contrast certification, motion quality or performance measurements. Frontend/QA owners must validate implemented version and breakpoint behavior. No new Figma edits by this reviewer.

## Approved implementation update
Implemented Calm A foundations in `frontend/src/styles.css`, preserving existing functional classes and grid areas. All component color literals now consume semantic variables; new root theme pair maps both light and dark backgrounds, surfaces, text, brand/on-brand, controls, statuses and focus. Desktop source width is approximately40% of the workspace; mobile keeps the full accessible queue and stacks evidence above editor. Supporting text has a12px floor, editor/body16px; question18px. Existing editor animation removed to avoid re-entry on edits. Receipt check is static unless frontend adds `is-new-confirmation` after a new confirmed response. New frontend semantic classes are styled.

Build passed after CSS formatting: Vite output CSS22.19KB/5.36KB gzip; JS245.02KB/76.33KB gzip. Bundle numbers are local build outputs, not device speed metrics. `design/contrast-v3.json` records24 exact semantic token contrast calculations: normal text pairs≥4.5, focus/controlborder pairs≥3, both themes. It does not test every rendered component or constitute full accessibility conformance. Production screenshots and interaction QA belong to the independent QA/accessibility owners.

Fixed Concept B dark heading/eyebrow contrast in the static HTML; previously generated Concept B PNG must be refreshed. Implementation CSS is frozen pending specific QA defects.
