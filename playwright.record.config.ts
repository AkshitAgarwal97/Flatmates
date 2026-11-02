import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "full-app-record.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "recordings/html-report" }]],
  timeout: 180_000,
  outputDir: "recordings/artifacts",
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:3000",
    trace: "on",
    screenshot: "on",
    video: { mode: "on", size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    launchOptions: { slowMo: 220 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } } }],
});
