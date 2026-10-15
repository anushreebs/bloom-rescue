# Accessibility verification: bounded automated coverage

Target: WCAG 2.2 AA. **No claim of full conformance.** Executed against the local React demonstration in Chromium, 14 October 2026.

## Tested

Playwright 1.64.1, @axe-core/playwright 4.13.0, axe-core 4.14.0 dependency set; bundled fallback Chromium **153.0.8010.0**. Exact browser version and scan results are stored in `artifacts/axe/scan-*.json`.

Six axe scans cover initial queue, supported review, submitted mock receipt, authorization review, uncertain submission and narrow mobile review. WCAG2A/AA and WCAG2.1AA tags are enabled. The automated gate found **zero axe violations (including serious or critical)** in these states. All six scans returned zero incomplete rules; the retained outputs permit inspection. a clean automated scan is not proof of accessibility.

Keyboard assertions: Tab reaches the skip link first; Enter activates it; keyboard Enter on an application control opens the review; focus moves to its heading. This is partial entry/focus coverage, not a completed keyboard-only end-to-end path. DOM roles and focus assertions do not establish spoken screen-reader announcements.

At **320×812 CSS pixels**, with reduced motion requested, the application review opens, remains actionable, and `documentElement.scrollWidth <= innerWidth` passes. A full-page screenshot is retained. Desktop screenshots use the Playwright Desktop Chrome viewport. Tests use real button/label/heading selectors rather than CSS-only clicks.

## Not tested / limitations

Real screen reader, all keyboard actions and reverse navigation, 200%/400% native browser zoom, all contrast color combinations beyond automated rendered-state checks, touch-device hardware, high-contrast mode, cross-browser behavior, WCAG 2.2-specific criteria beyond the tested subset, and every API failure-state combination. No measured usability improvement or accessibility certification is implied.

## Follow-up before broader deployment

Complete keyboard task execution and focus recovery on error; test NVDA/VoiceOver announcements; audit zoom, contrast and touch targets across all states; address all meaningful axe manual-review items. Fictional and deterministic-mode labels must remain visible to avoid a misleading impression of a real integration.
