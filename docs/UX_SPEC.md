# Recovery workspace: UX and accessibility specification

Status: design specification, not evidence of implemented or tested accessibility. Owner: UX/accessibility specialist. WCAG 2.2 AA is the implementation target; no conformance claim follows from this document.

## Product boundaries and language

Show a persistent, compact header: **Bloom Rescue · independent fictional demo** and **Deterministic evidence mode** or **Live model API mode**, derived from the server response. Explain that fictional data and a mock ATS are used. Never label a mock receipt an employer confirmation. A live model selection must not masquerade as a successful API call when configuration fails.

The recovery opportunity is a hypothesis. Existing Bloom assessment evidence did not establish that its recovery workflow is missing or broken. This demo explores an independently designed workflow.

## Information architecture

Three task screens may be conditional views in one small React application, not a routing dependency:

1. **Recovery queue:** five fictional applications, employer, role, question summary, text status and an Open action. Heading and short explanation precede the list. Include total count; do not imply external polling or live applications.
2. **Review answer:** application context, full employer question, evidence, draft editor, source references, missing information and review actions.
3. **Recovery outcome:** current status, approved answer, mock submission receipt where available and ordered audit events. Offer Back to queue. For an ambiguous timeout, prioritize Check submission status over any submit action.

Saved answers are an accessible secondary region or screen with topic, context, answer text and Revoke reuse permission. No card-only click targets; each application has a named button/link. Avoid modal dialogs when an inline confirmation and result suffice.

## Responsive layout

At desktop width, use a bounded content width, queue/sidebar and main review area with enough room for approximately 60–80 character text lines. Evidence and editor remain adjacent only when neither becomes cramped. At 320–767 CSS pixels use one column in task order: application, question, evidence, draft, actions, history. Buttons wrap or fill available width. No required horizontal page scroll at 320 CSS pixels or 400% browser zoom. Long source IDs, URLs and receipt IDs wrap. Tables, if necessary, have labelled scroll containers; a stacked list is preferred for this small dataset.

Use a restrained type scale, readable body text, sufficient line height, explicit labels, and status icon/text plus color. Visible button text must describe its action: Generate evidence draft, Approve answer, Resume mock application, Check submission status. Avoid a generic Continue when the next action has consequences.

## Review interaction

1. Open an interrupted application. Move focus to the review heading; preserve queue selection for return.
2. Generate evidence draft announces “Generating an evidence draft” in a polite live region. Set the affected region aria-busy. Disable repeated resolution for this application; other local navigation remains available. Retain context during the operation. Never move focus to a spinner.
3. On success, announce “Draft ready for review”, display evidence excerpts with stable source IDs, and put focus on the draft heading or preserve the initiating control with a clear next step. Reading a generated draft is not consent.
4. Use a labelled multiline text area with a help-text association: factual technical statements must be supported by listed evidence; changes are checked on approval. Distinguish extractively verified text from human-supplied information. Do not present a generic green check as proof of broad semantic accuracy.
5. Display Missing information as an explicit list. Unsupported drafts can be empty; the editor must not prefill a guess or imply lack of evidence proves lack of experience.
6. Consent checkbox is unchecked by default: “Save this approved answer for reuse in similar questions.” Explain reuse is limited by question context and can be revoked. Approval and reuse consent are separate actions. Never require consent to proceed.
7. Sensitive questions show a prominent explanation, an initially empty answer and an unchecked explicit confirmation checkbox: “I confirm this information is accurate.” Authorization or compensation must not be inferred from profile proximity or old unrelated answers.
8. Approve answer validates current revision, answer and confirmation. Display specific inline errors associated with the field, with a summary for multiple errors. On approval show an explicit Approved status; submission remains a separate human action.
9. Resume mock application submits only the approved revision. Editing an approved answer requires a clearly implemented re-review flow; otherwise make that answer read-only and explain why. Do not allow edits to silently change the previously approved payload.

### Unsupported technical information decision

The contract presently permits human-supplied unknown/sensitive personal answers but requires technical answers to match verified evidence. For a-cloud, the smallest safe demo may show escalation and remain awaiting_review. Do not offer an apparently functioning technical manual-answer path that the API rejects without explanation. If the architect adds human-attested technical evidence, label its provenance and require confirmation; do not describe it as independently verified. This is a release decision, not an assumed feature.

## State presentation and actions

| Persisted state | User-facing status | Primary action | Essential feedback |
|---|---|---|---|
| interrupted | Needs your review | Generate evidence draft | Blocking question is visible |
| resolving | Preparing draft | None while request active | Busy region and plain-language progress |
| awaiting_review | Review required | Approve answer when valid | Evidence, missing information, edit and consent |
| approved | Answer approved | Resume mock application | Exact approved text and separate submission action |
| submitting | Sending to mock ATS | None while active | Do not navigate into a false success state |
| verification_required | Submission status uncertain | Check submission status | “The mock ATS may have accepted this application. Check before retrying.” |
| submitted | Submitted to mock ATS | View history / Back to queue | Receipt ID and explicit mock label |
| failed | Could not prepare draft | Retry draft where safe | Sanitized cause, retained inputs and recovery |

A request timeout in the browser is not evidence the server failed. Preserve the current draft where safe and reload authoritative application state before enabling a repeated consequential action. On ambiguous submission, reconciliation must precede any new submit. A terminal submitted application has no resubmit action.

## Five scenario scripts

- **a-rest:** open supported REST question → generate → inspect source excerpt → edit only within supported text → approve without reuse consent → resume → show mock receipt and state history.
- **a-cloud:** generate → show no supporting cloud evidence and missing information → do not fabricate or submit. Explain the bounded escalation limitation if manual technical attestation is deferred.
- **a-auth:** generate → show sensitive notice and empty editor → approval without confirmation fails clearly → enter fictional user-confirmed answer, check confirmation → approve → resume. Do not supply a suggested authorization answer.
- **a-reuse:** show approved-answer source and matching topic/context → user reviews the quote → approve explicitly. Past approval does not auto-approve a new application. Revoke saved answer and verify it is not retrieved for later drafts.
- **a-timeout:** approve REST-supported answer → resume → show uncertain status, no success claim → Check submission status → show one persisted mock receipt and one accepted submission. Repeated checks must not create another acceptance.

## Error, empty and recovery states

- Initial loading: labelled loading text, not a blank panel or skeleton alone.
- Empty queue: “No fictional applications in this queue” and explain reset only if supported. Do not show a generic failure illustration.
- Network unavailable: retain visible context; provide a scoped Retry that refreshes authoritative state. Do not expose raw server exceptions.
- 409 stale revision: “This application changed. Reload the current version before approving.” Refresh data; never silently approve against a newer revision. Preserve unsaved draft separately so the user can compare.
- 422 unsupported facts: identify that the edit could not be supported, retain edited text, show source evidence and next steps. Do not claim the user is lying.
- Provider error: show model mode and bounded retry availability. Never silently substitute deterministic output for an API failure without explicit mode and warning.
- Saved answer revocation: confirmation names the scope: future reuse stops, an existing application approval and mock receipt remain. Announce successful revocation; failure leaves the entry present.
- Reset, if exposed, must clearly say it replaces fictional demo state and require deliberate confirmation. Do not put it next to Resume with the same visual emphasis.

## Accessibility implementation requirements

- Semantic header, navigation and main, one page h1, logical heading levels, lists for cards and history, real buttons for actions and labels for every input.
- A skip link is the first keyboard-focusable item. All actions operable using Tab/Shift+Tab, Enter and Space without pointer-only hover or dragging. No positive tabindex.
- Focus ring clearly visible on every control, at least a 2 CSS-pixel outline with spacing and sufficient contrast. Do not remove outline unless replaced.
- Text contrast at least 4.5:1 for normal text, 3:1 for qualifying large text; control boundaries and focus indicators target 3:1 against adjacent colors. Measure actual selected colors; this specification is not a measurement.
- Touch targets at least WCAG 2.2's 24 by 24 CSS pixels (subject to specified exceptions), preferably 44 by 44 for primary actions. Adequate spacing between destructive and normal actions.
- Status announcements use a stable role=status / aria-live=polite region. Urgent submit errors may use role=alert once. Avoid making the entire changing page a live region or repeating each audit event aloud.
- Associate hints and errors via aria-describedby; set aria-invalid after validation. Never rely only on placeholder text or a disabled button to explain requirements.
- Disabled busy controls retain an understandable label; do not trap focus. Navigation and asynchronous updates must not unexpectedly steal focus or jump the page.
- Respect prefers-reduced-motion. No required animation, flashing or auto-advancing content. Loading text remains available when motion is removed.
- Evidence and mock receipts are selectable text, not screenshots. Dates are readable and consistently labelled; event order is explicit.

## Verification and acceptance matrix

| Test | Acceptance |
|---|---|
| Keyboard-only REST happy path | Queue → evidence → edit → consent optional → approve → resume → outcome, with visible focus and no trap |
| Keyboard-only sensitive flow | Checkbox and editor named; missing confirmation produces associated error; no inferred answer |
| Async status announcements | Draft-ready, failure, uncertain submission and success announced once without losing task context |
| Automated axe scans | No critical/serious violations in queue, awaiting-review, sensitive, verification-required and submitted views; automated coverage is partial |
| Mobile 375×812 and 320 CSS pixels | No page-level horizontal scrolling; every action and question readable |
| 200% / 400% zoom | Content reflows and controls remain reachable; any exception documented |
| Reduced motion | Task remains understandable without transitions or spinner animation |
| Contrast audit | Actual text, error, muted, control and focus colors measured against their backgrounds |
| Error recovery | 409/422/network/provider failures retain context, explain next step and never imply submission success |
| Duplicate protection presentation | Timeout offers status check; no resubmit action after persisted submitted state |

Run manual checks in addition to Playwright/axe. Screen-reader announcements require a real assistive-technology session to claim they were tested; DOM assertions alone do not establish spoken behavior. Report browser, viewport, test tool versions and exact flows exercised in the final accessibility report.

## Tradeoffs, limitations and architect decisions

The extractive verifier intentionally limits natural rewriting. This is a visible safety constraint, not a polished general-answer assistant; explain it before editing to avoid surprise rejection. A one-page workspace keeps the demo small but needs deliberate focus management. Optimistic revision conflicts favor correctness over seamless saving. Reuse is opt-in and contextual, which adds friction but preserves control.

Architect decisions requested: confirm unsupported-cloud escalation versus human-attested technical evidence; define whether resetting demo state is exposed; approve accessible inline confirmation instead of modal dialogs. No UX claim above establishes user demand, recovery-rate improvement, WCAG conformance or real Bloom implementation behavior.
