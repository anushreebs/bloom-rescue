# Design council — final decision

Twelve real agents completed independent first reviews. UX, Motion, Performance, Accessibility and Red Team then explicitly answered the twelve challenge questions. See their CHALLENGE reports. No external models were consulted or claimed. Repeated agreement does not add evidence.

## Concept selection

Three editable high-fidelity static boards and actual rendered PNGs are delivered: A Calm Intelligence, B Immersive Recovery, C Precision Workspace. Visual director's weighted subjective ratings follow the requested25/20/20/15/10/10 weighting: A4.75, B4.35, C4.30 out of5. They are design judgments, not measured usability, speed or compliance. A critical functional, trust or accessibility defect blocks release regardless of score.

Choose **A Calm Intelligence**, with queue density consistent with A rather than a second competing visual system. Keep the existing plum identity, enlarge supporting text and evidence space, reduce repeated framing. Optional dark mode uses semantic equivalents of the same design, not B's larger shadows or cinematic effects. All three concepts remain proposals; the implemented A refinement must be tested separately.

## Reasons and disputes

- Visual drama vs task clarity: B is expressive but increases emphasis competition around sensitive evidence. Precise hierarchy and truthful transitions are more relevant to the existing task. No user study establishes a universal aesthetic winner.
- Dark mode vs release burden: requested and useful to demonstrate token discipline, but not inherently better. Include only after both themes pass key-state contrast, keyboard and reflow checks.
- Browser context vs complexity: implement only allowlisted application-ID selection through URL/history; no router library, answer text or sensitive details in URLs. Test refresh, Back/Forward and invalid IDs. Keep unsaved answer buffers in memory, keyed by application and revision; no answer persistence promise across reload.
- Motion vs trust: animate presentation without remounting the editor or delaying controls. Receipt animation only after a newly confirmed action response, never simply reopening an existing receipt. No fake reasoning or progress percentages.
- Queue density vs discovery: preserve all five accessible queue items on mobile; the static concept's hidden mobile queue must not enter production. Keep stable order and explicit next-action guidance. Complex grouping/filters deferred for five items.

## Approved implementation and ownership

Frontend specialist7 owns TSX/state/component tests and frontend README. Visual specialist1 owns styles.css and semantic themes. No concurrent overlap. Root owns integration/reporting; backend/manifests/API contracts unchanged. Performance8 owns benchmarks, Accessibility9 owns its new E2E file, QA11 owns its new workflow file and capture. Specialist12 performs final independent source/rendered review.

Must-fix: session edit loss, misleading resolve notices, field-invalid association, stale history errors, successful mutations misreported after supplemental failures. Also improve source/generated/edited/approved provenance, state-derived next action/outcome summary, bounded action focus, URL context, native motion and readable foundations. Existing approval/consent/submission boundaries and mock labels remain.

Figma current-access check confirmed quota exhaustion. Existing editable Figma is a prior design checkpoint; new HTML boards, tokens and implemented code are the current source. Do not claim Figma synchronization or new native animation wiring.
