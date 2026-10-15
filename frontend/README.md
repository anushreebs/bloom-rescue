# Recovery workspace

React 19 / TypeScript / Vite single-page client. All data is fictional. This is an independent concept, not Bloom's application or an authorized integration.

From this directory: `npm ci`, `npm run dev`. Start the backend separately as described in the root README. Vite proxies `/api` to localhost:8000. The demo header token is public local-demo-token; it is not production authentication.

Use the queue buttons to select a scenario, generate an extractive draft, inspect its source, approve, and separately resume a mock application. Cloud answers without evidence remain blocked. Authorization requires user-supplied fictional information and explicit confirmation. The timeout scenario offers reconciliation, never an unqualified success. Saved-answer permission can be revoked independently of an existing approval.

`npm test` runs the component tests. `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build` provide static checks. See QA's report for browser, axe and responsive coverage; component DOM checks do not establish screen-reader behavior.

Requests abort after 30 seconds. Consequential failures trigger an authoritative-state refresh and preserve the editor text for review. This bounded demo globally disables queue navigation during a mutation. An approved answer is read-only; editing and re-review after approval is deferred. Technical verification is deliberately extractive, so free paraphrasing can be rejected. There is no automatic approval, live ATS, production authentication, or real employer confirmation.

## Workspace redesign

The compact application workspace uses system fonts, local inline SVG and CSS motion, with no animation library or external asset requests. `WorkspaceVisuals.tsx` isolates the evidence rail, decorative empty-state illustration and persisted-state progress indicator. Progress comes from actual application state; pending requests have an indeterminate spinner and no invented percentages. Submitted receipts retain an explicit mock label.

Queue and panel entry motion is transform-only so readable text does not pass through transient low-contrast opacity. Decorative illustration elements and the receipt check use bounded entrance animations. `prefers-reduced-motion` disables all transitions and keyframes, including request spinners, while retaining visible status text and the complete static check. Loading queue placeholders reserve layout without fake delay or animated shimmer. The mobile queue uses native horizontal scrolling; every item remains a semantic button and can be reached with keyboard navigation.

Supporting labels use an 11px minimum and normal help text 13px. Queue controls and action buttons have a 44px minimum height. These design choices are subject to the separate browser/axe/performance review; they are not a claim of complete accessibility conformance.
