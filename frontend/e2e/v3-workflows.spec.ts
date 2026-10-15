import { test, expect, type Page } from '@playwright/test';
import type { Application, Resolution } from '../src/types';

// Isolated transport fixtures: these assert frontend behavior, not provider/ATS integration.
const answer = 'I built and integrated REST APIs using Python and TypeScript.';
const resolution: Resolution = {
  answer, claims: [{ text: answer, quote: answer, source_id: 'e-rest' }],
  missing_information: [], requires_confirmation: false, verdict: 'supported',
  mode: 'deterministic', latency_ms: 1, tokens: null, warnings: [],
};
function app(id: string, company: string): Application {
  return { id, candidate_id: 'c-demo', company, role: 'Fictional intern',
    question: 'Describe your REST API development experience.', question_kind: 'technical',
    state: 'awaiting_review', revision: 2,
    evidence: [{ id: 'e-rest', candidate_id: 'c-demo', kind: 'profile', topic: 'rest', text: answer, context: 'REST API development experience' }],
    draft: structuredClone(resolution), approved_answer: null, receipt: null, scenario: 'normal' };
}
async function fixtures(page: Page, options: { delayedResolve?: boolean; failResolve?: boolean; failHistory?: boolean; long?: boolean; delayedApprove?: boolean; conflictApprove?: boolean } = {}) {
  const applications = [app('a-rest', 'Fable Labs'), app('a-cloud', 'Paper Orbit')];
  if (options.long) applications[0].question = 'Describe REST experience including errors, retries and testing. '.repeat(30) + 'x'.repeat(180);
  let release = () => {};
  const barrier = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/**', async route => {
    const pathname = new URL(route.request().url()).pathname.replace('/api', '');
    if (pathname === '/health') return route.fulfill({ json: { mode: 'deterministic', status: 'ok' } });
    if (pathname === '/applications') return route.fulfill({ json: { applications } });
    if (pathname === '/answers') return route.fulfill({ json: { answers: [] } });
    if (pathname.endsWith('/events')) return route.fulfill(options.failHistory ? { status: 503, json: { detail: 'Fixture history unavailable' } } : { json: { events: [] } });
    const current = applications.find(a => pathname.includes(a.id));
    if (!current) return route.fulfill({ status: 404, json: { detail: 'Unknown fixture' } });
    if (pathname.endsWith('/resolve')) {
      if (options.delayedResolve) await barrier;
      if (options.failResolve) return route.fulfill({ status: 503, json: { detail: 'Fixture provider unavailable' } });
      current.revision++; current.state = 'awaiting_review'; current.draft = structuredClone(resolution);
      return route.fulfill({ json: current });
    }
    if (pathname.endsWith('/approve')) {
      if (options.delayedApprove) await barrier;
      if (options.conflictApprove) { current.revision++; return route.fulfill({ status: 409, json: { detail: 'Fixture stale revision' } }); }
      current.revision++; current.state = 'approved'; current.approved_answer = JSON.parse(route.request().postData() || '{}').answer;
      return route.fulfill({ json: current });
    }
    return route.fulfill({ status: 400, json: { detail: 'Unhandled fixture request' } });
  });
  return { applications, release };
}
const select = (page: Page, name: string) => page.getByRole('button').filter({ hasText: name }).click();

test('fixture: session edits survive A-B-A and allowlisted URL navigation; reload restores server draft', async ({ page }) => {
  await fixtures(page); await page.goto('/?application=a-rest');
  await expect(page.getByLabel('Answer for your review')).toHaveValue(answer);
  await page.getByLabel('Answer for your review').fill('Unsaved fictional edit');
  await select(page, 'Paper Orbit'); await expect(page).toHaveURL(/application=a-cloud/);
  await select(page, 'Fable Labs'); await expect(page.getByLabel('Answer for your review')).toHaveValue('Unsaved fictional edit');
  await page.goBack(); await expect(page).toHaveURL(/application=a-cloud/);
  await page.goForward(); await expect(page.getByLabel('Answer for your review')).toHaveValue('Unsaved fictional edit');
  await page.reload(); await expect(page.getByLabel('Answer for your review')).toHaveValue(answer);
  await page.goto('/?application=invalid'); await expect(page.getByRole('button').filter({ hasText: 'Fable Labs' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('fixture: slow request reflects actual pending operation and no automatic approval', async ({ page }) => {
  const data = await fixtures(page, { delayedResolve: true }); data.applications[0].state = 'interrupted'; data.applications[0].draft = null;
  await page.goto('/?application=a-rest');
  await page.getByRole('button', { name: 'Generate evidence draft' }).click();
  await expect(page.getByRole('status').filter({ hasText: /Generating|Preparing/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Resume mock application' })).toHaveCount(0);
  await expect(page.getByText(/99%|Analysing your career|Contacting employer/)).toHaveCount(0);
  data.release(); await expect(page.getByLabel('Answer for your review')).toHaveValue(answer);
  await expect(page.getByRole('button', { name: 'Approve answer', exact: true })).toBeVisible();
});

test('fixture: successful approval remains approved when optional history fails', async ({ page }) => {
  await fixtures(page, { failHistory: true }); await page.goto('/?application=a-rest');
  await page.getByRole('button', { name: 'Approve answer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume mock application' })).toBeVisible();
  await expect(page.getByLabel('Approved answer', { exact: true })).toHaveValue(answer);
  await expect(page.getByRole('status').filter({ hasText: /approved/i }).first()).toBeVisible();
  await expect(page.getByText('No recorded transitions yet.', { exact: true })).toHaveCount(0);
});

for (const width of [1440, 768, 390, 320]) {
  test(`fixture: long content and theme persistence reflow at ${width}px`, async ({ page }) => {
    await fixtures(page, { long: true }); await page.setViewportSize({ width, height: 1000 }); await page.goto('/?application=a-rest');
    await expect(page.getByLabel('Answer for your review')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const theme = page.getByRole('button', { name: 'Dark theme', exact: true });
    await theme.click(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await theme.click(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
}

test('fixture: provider failure preserves an existing edited draft', async ({ page }) => {
  const data = await fixtures(page, { failResolve: true }); data.applications[0].state = 'failed';
  await page.goto('/?application=a-rest');
  await page.getByLabel('Answer for your review').fill('Unsaved edit retained after provider failure');
  await page.getByRole('button', { name: 'Generate evidence draft' }).click();
  await expect(page.getByRole('alert')).toContainText('Fixture provider unavailable');
  await expect(page.getByLabel('Answer for your review')).toHaveValue('Unsaved edit retained after provider failure');
  await expect(page.getByRole('button', { name: 'Generate evidence draft' })).toBeEnabled();
});

test('fixture: server revision change clears prior answer reuse consent', async ({ page }) => {
  await fixtures(page, { conflictApprove: true });
  await page.goto('/?application=a-rest');
  const consent = page.getByLabel('Save this approved answer', { exact: false });
  await consent.check();
  await page.getByRole('button', { name: 'Approve answer', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('stale revision');
  await expect(consent).not.toBeChecked();
});

test('V3 actual deterministic workflow recording and light/dark desktop/mobile captures', async ({ browser }) => {
  test.skip(process.env.V3_RECORD_DEMO !== '1', 'Optional capture run against a fresh fictional backend.');
  const { mkdirSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const output = resolve('../artifacts/v3'); mkdirSync(output, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, recordVideo: { dir: output, size: { width: 1440, height: 1100 } } });
  const page = await context.newPage();
  async function mobileShot(filename: string) {
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, storageState: await context.storageState() });
    const screen = await mobile.newPage(); await screen.goto(page.url());
    await expect(screen.getByText('Deterministic evidence mode', { exact: true })).toBeVisible();
    await screen.screenshot({ path: resolve(output, filename), fullPage: true }); await mobile.close();
  }
  await page.goto('http://127.0.0.1:5173/');
  await expect(page.getByText('Deterministic evidence mode', { exact: true })).toBeVisible();
  await page.screenshot({ path: resolve(output, 'queue-light-desktop.png'), fullPage: true });
  await mobileShot('queue-light-mobile.png');
  await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
  await page.screenshot({ path: resolve(output, 'queue-dark-desktop.png'), fullPage: true });
  await mobileShot('queue-dark-mobile.png');
  await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
  await select(page, 'Fable Labs'); await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Generate evidence draft' }).click();
  await expect(page.getByLabel('Answer for your review')).toHaveValue(answer);
  await page.waitForTimeout(700);
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
    await page.screenshot({ path: resolve(output, `draft-${theme}-desktop.png`), fullPage: true });
    await mobileShot(`draft-${theme}-mobile.png`);
  }
  await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
  await page.getByRole('button', { name: 'Approve answer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume mock application' })).toBeVisible();
  await page.waitForTimeout(650);
  await page.getByRole('button', { name: 'Resume mock application' }).click();
  await expect(page.getByRole('heading', { name: 'Submitted to the mock ATS', exact: true })).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(output, 'receipt-light-desktop.png'), fullPage: true });
  await select(page, 'Lantern Demo');
  await page.getByRole('button', { name: 'Generate evidence draft' }).click();
  await expect(page.getByLabel('Answer for your review')).toBeVisible();
  await page.getByRole('button', { name: 'Approve answer', exact: true }).click();
  await page.getByRole('button', { name: 'Resume mock application' }).click();
  await expect(page.getByRole('heading', { name: 'Check before retrying' })).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(output, 'uncertain-light-desktop.png'), fullPage: true });
  await mobileShot('uncertain-light-mobile.png');
  await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
  await page.screenshot({ path: resolve(output, 'uncertain-dark-desktop.png'), fullPage: true });
  await mobileShot('uncertain-dark-mobile.png');
  await page.getByRole('button', { name: 'Check submission status', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Submitted to the mock ATS', exact: true })).toBeVisible();
  await page.waitForTimeout(1000);
  const video = page.video(); await context.close(); await video?.saveAs(resolve(output, 'workflow-demo.webm'));
});


test('fixture: delayed approval cannot announce another application success after browser Back', async ({ page }) => {
  const data = await fixtures(page, { delayedApprove: true });
  await page.goto('/?application=a-cloud'); await select(page, 'Fable Labs');
  await page.getByRole('button', { name: 'Approve answer', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Checking your answer' }).first()).toBeVisible();
  await page.goBack(); await expect(page).toHaveURL(/application=a-cloud/);
  data.release();
  await expect.poll(() => data.applications[0].state).toBe('approved');
  await expect(page.getByRole('button', { name: 'Approve answer', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Resume mock application' })).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'Answer approved' })).toHaveCount(0);
  await expect(page.getByLabel('Answer for your review')).toHaveValue(answer);
  await expect(page.getByRole('heading', { name: 'Review the blocking question' })).toBeFocused();
});

test('fixture: delayed refresh after Back cannot leave a stale running notice', async ({ page }) => {
  const data = await fixtures(page); data.applications[0].state = 'resolving';
  await page.goto('/?application=a-cloud'); await select(page, 'Fable Labs');
  let release = () => {};
  const barrier = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/applications', async route => {
    await barrier; await route.fulfill({ json: { applications: data.applications } });
  });
  await page.getByRole('button', { name: 'Refresh application state' }).click();
  await page.goBack(); await expect(page).toHaveURL(/application=a-cloud/);
  release();
  await expect(page.getByRole('button', { name: 'Approve answer', exact: true })).toBeEnabled();
  await expect(page.getByText('Another application action is still running.', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: /refreshing|still running/i })).toHaveCount(0);
});
