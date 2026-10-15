# AI interaction review — independent round 1

Scope: source inspection of `frontend/src/App.tsx`, `WorkspaceVisuals.tsx`, `types.ts`, `api.ts`, and existing component tests, against the shared V3 brief and full user attachment. No other new V3 specialist conclusions were read. This is a code-based review, not user research or a fresh runtime test.

## Preserve

- Source excerpts sit beside the answer and distinguish profile evidence from previously approved answers. The details disclosure preserves access to context.
- Deterministic and API-produced excerpts are explicitly labelled; quoted-source validation is not presented as general fact-checking.
- Approval, optional reuse consent and mock submission are separate. Missing technical evidence disables approval; sensitive answers require human confirmation. Uncertain submission is not shown as success.

## Three key findings

| Priority and classification | Evidence | Consequence and proposed change | Limits / counterargument |
|---|---|---|---|
| Must fix: verified local draft retention gap | `App.tsx` stores one `answer` string; `open(a)` replaces it from server draft or approved answer, without saving the outgoing local edit. Same-card selection also resets it. No dirty-state indicator exists. | An unapproved edit is discarded when selecting another application. Preserve a session-only edit map keyed by application ID and server revision. Show “Edited by you · not approved”; provide explicit restore-to-generated-draft and clear distinction from approved locked payload. | Not a demonstrated customer incident. Session-only memory does not promise refresh persistence. Full durable draft synchronization is outside this backend contract. Warn before leaving with unsaved edits if needed; do not silently add personal answers to browser storage. |
| Should improve: verified provenance distinction is incomplete | The answer label is “Answer for your review” for both original server draft and any user edits. `onChange` does not compare with `app.draft.answer`. SourceRail displays selected claim quotes regardless of subsequent edits. | Evidence next to a modified answer could be mistaken for verification of those edits. Label the origin and pending status dynamically: “Draft from profile excerpts”, “Edited by you · awaiting checks”, or “Human-provided answer · confirmation required”. Keep source label factual: “Selected source excerpts”, not “Your answer is verified”. | Backend still rejects unsupported technical edits; no proof users misinterpret current view. Avoid a full line-by-line diff initially: simple provenance labels and a restore control provide most value at low complexity. |
| Should improve: verified completion message overgeneralizes the returned result | `act('resolve')` sets “Draft ready for review.” regardless of `verdict` or returned `state`. Resolution can be missing-information, sensitive, or failed. Shared `busy` also marks the entire workflow as working. | Use result-derived messages: supported → “Draft ready for your review”; sensitive → “Your answer is needed”; missing → “No supported answer found”; failed → “Draft could not be prepared.” During requests show only the actual operation (“Preparing evidence draft…” / “Checking approval…” / “Checking mock receipt…”), with no staged reasoning or percent confidence. | Warnings and controls elsewhere already expose these conditions. A neutral “Evidence check finished” is safer when state/verdict is uncertain. Server states, not animation completion, remain authoritative. |

## Recommended UI contract, no backend change

| Situation | Answer origin | Claim status / action |
|---|---|---|
| Before resolve | No draft yet | Generate evidence draft; no promise it can answer |
| Supported deterministic result | Rule-selected excerpts | Review source matches; approve separately |
| Supported API result | Model-selected excerpts | Same review boundary; API mode is not stronger factual assurance |
| Local edit differs from draft | Edited by you | Pending approval checks; sources shown as references only |
| Sensitive empty / typed | Human input required / human-provided | No inferred authorization; explicit confirmation remains required |
| Missing evidence | No supported answer | Explain limitation; do not fabricate a negative experience claim |
| Approved | Approved payload | Locked; local approval does not mean sent |
| Uncertain submission | Approved payload | Check receipt; no celebratory success |
| Submitted | Approved payload | Celebrate only confirmed local mock receipt; never employer confirmation |

Error recovery: retain local edit on API rejection/network error. Show inline operation-specific error and retry or refresh action. If refresh returns a conflicting revision, do not silently overwrite user text; show new server state and offer explicit discard/restore. If server has locked approval, display its authoritative approved answer and clearly mark any retained local draft as unsent. Keep sensitive confirmation false on restored/revised inputs. Preserve optional reuse as opt-in, not default.

Motion proposal: reveal results after server response; highlight selected-source cards and draft as a single 180–240 ms opacity/transform transition. Use a labelled indeterminate indicator while waiting. Never animate invented searching/reasoning substeps or confidence values. Reduced motion shows the same text/state instantly. Avoid typing animation that delays reviewing the answer.

## Acceptance checks to add

1. Edit application A, open B, return A: same session edit remains and is labelled unapproved. Clicking A again does not reset it.
2. Restore generated draft requires an explicit action and does not submit or save consent.
3. Missing/sensitive/failed resolve outcomes never announce “Draft ready”.
4. Unsupported edit rejection retains text and labels it pending/unapproved; no success indicator appears.
5. After confirmed server approval, locked payload matches response; approval and submission remain distinct.
6. Reduced motion and screen-reader status expose equivalent result semantics.

Confidence: high for the inspected state/control relationships; medium for the usefulness of extra provenance copy; user comprehension and task speed require testing. No new runtime tests executed by this role. No new Figma work claimed. Architect approval requested for session-only edit retention, derived provenance labels and result-specific feedback; backend extensions are not needed.
