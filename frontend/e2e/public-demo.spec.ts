import { test, expect } from "@playwright/test";

test("HTTPS proxy: cookies, CSRF, isolation, reconciliation, reset and SPA", async ({ browser }) => {
  const a = await browser.newContext({ ignoreHTTPSErrors: true });
  const b = await browser.newContext({ ignoreHTTPSErrors: true });
  try {
    const page = await a.newPage();
    const other = await b.newPage();
    const origin = "https://127.0.0.1:5443";
    await page.goto(origin + "/review?application=a-timeout");
    await expect(page.getByRole("heading", { name: "Review the blocking question" })).toBeVisible();
    const cookie = (await a.cookies()).find(c => c.name === "__Host-bloom-session");
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: "Strict", path: "/" });
    expect(await page.evaluate(() => document.cookie)).not.toContain(cookie!.value);
    expect((await a.request.post(origin + "/api/applications/a-timeout/resolve", {
      headers: { Origin: origin }, data: {},
    })).status()).toBe(403);
    await page.getByRole("button", { name: "Generate evidence draft" }).click();
    await page.getByRole("button", { name: "Approve answer", exact: true }).click();
    await page.getByRole("button", { name: "Resume mock application" }).click();
    await expect(page.getByRole("heading", { name: "Check before retrying" })).toBeVisible();
    await page.getByRole("button", { name: "Check submission status", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Submitted to the mock ATS", exact: true })).toBeVisible();
    await other.goto(origin + "/?application=a-timeout");
    await expect(other.getByRole("button", { name: "Generate evidence draft" })).toBeVisible();
    expect((await b.cookies()).find(c => c.name === "__Host-bloom-session")!.value).not.toBe(cookie!.value);
    expect((await (await b.request.get(origin + "/api/applications/a-timeout/events")).json()).events).toEqual([]);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Submitted to the mock ATS", exact: true })).toBeVisible();
    page.on("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Reset demo workspace" }).click();
    await expect(page.getByRole("button").filter({ hasText: "Lantern Demo" })).toBeVisible();
    await page.getByRole("button").filter({ hasText: "Lantern Demo" }).click();
    await expect(page.getByRole("button", { name: "Generate evidence draft" })).toBeVisible();
    await expect(other.getByRole("button", { name: "Generate evidence draft" })).toBeVisible();
    const missing = await a.request.get(origin + "/api/unknown-route");
    expect(missing.status()).toBe(404);
    expect(missing.headers()["content-type"]).toContain("application/json");
  } finally {
    await a.close();
    await b.close();
  }
});
