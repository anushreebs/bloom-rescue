# Principal frontend review — independent round one

Scope: read actual `frontend/src/App.tsx`, `api.ts`, `types.ts`, `WorkspaceVisuals.tsx`, CSS foundation and package manifest. No production edits and no other V3 role findings read. This is source inspection, not a runtime/browser performance assessment.

## Three consequential findings

| Classification | Finding / evidence | Consequence and proposal |
|---|---|---|
| Verified source behavior | `open()` always replaces the single `answer` state from server draft/approved answer and resets consent/confirmation. Navigating A → B → A therefore discards unsaved local edits. No local per-application draft map exists. | Preserve session-only answer edits by application ID + revision, and visibly label unsaved edits. Preserve consent/confirmation only for the exact unchanged text and revision; reset them when answer changes. Do not promise refresh persistence unless implemented. Add regression test A edit → B → A. |
| Verified source behavior | `loadEvents()` guards successful response against active application, but its catch in `open()` unconditionally sets global error. Slow failure for A can show history error in B. Main mutation try includes supplemental events/saved-answer fetches; a successful mutation followed by history failure is reported as operation failure. | Separate authoritative mutation success from supplemental refresh warnings; gate history errors by active ID. Add delayed navigation and partial-failure tests. Keep safe state reload and submission uncertainty wording. |
| Design / maintainability opportunity | `App.tsx` contains networking, navigation, editor, queue, consent, history and outcomes in one ~650-line component. State is stringly typed. CSS foundation defines only three semantic variables while most colors remain literal; no theme capability currently exists. | Extract queue and editor/outcome components only where ownership is clear; add a small workflow/presentation helper instead of introducing a state library. Build dark/light semantic surface/text/border/status tokens and a persisted theme preference with guarded storage and system fallback. Keep semantic state accuracy independent of color/motion. |

## Preserve

- Separate approval and submission; unsupported technical facts cannot be approved.
- Existing focus-on-selected-workspace, skip link, native details, live feedback and reduced-motion implementation.
- API timeout and 409 reload handling; no new animation library is necessary.
- Source evidence beside editor and explicit mock receipt boundaries.

## Bounded implementation proposal

1. Root chooses design direction and assigns CSS owner first. Frontend owner changes TSX only to avoid overlap.
2. Add typed per-application session editor state and explicit unsaved status; show unchanged vs user-edited provenance without claiming edits are verified.
3. Add accessible theme button and root data-theme, preserving actual workflow controls and test selectors.
4. Separate supplemental history loading/error into dedicated status rather than reporting successful mutation as failed.
5. Extract RecoveryQueue as reusable presentational component if scope permits; avoid broad architecture churn in a visual release.

## Strongest counterargument

Splitting components and adding draft caches can create more state coordination bugs than the small fixed demo warrants. Prefer the minimal state fix and two or three presentation boundaries; no routing store, animation framework or autosave/backend API changes.

## Confidence and limitations

High confidence in the `open()` edit-loss behavior and supplemental-fetch coupling from direct code; browser reproduction not yet performed in this independent round. Medium confidence that component extraction benefits future maintenance; this is engineering judgment. Dark mode is requested capability, not a diagnosed defect. Screen-reader, contrast, frame-rate, network and mobile runtime testing are not performed here. I cannot establish customer needs, backend behavior or visual preference from source inspection.

Artifacts: this report only. Tests run: none in this first source audit; root coordinates baseline and implementation verification. Approval requested: bounded TSX state/navigation/theme implementation after council direction.
