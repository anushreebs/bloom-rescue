import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  testMatch: "public-demo.spec.ts",
  workers: 1,
  outputDir: "test-results-public",
  use: {
    baseURL: "https://127.0.0.1:5443",
    ignoreHTTPSErrors: true,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : undefined,
  },
  webServer: {
    command: "../.venv/bin/python scripts/https-demo-test.py",
    url: "https://127.0.0.1:5443/api/health",
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
  },
});
