import { defineConfig, devices } from "@playwright/test";

// Production build: `next dev` blocks its HMR origin for 127.0.0.1 here, so the
// browser never hydrates. `next start` is also the honest sign-off target.
const PORT = Number(process.env.PORT ?? 3211);
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      testIgnore: /contract\//,
      use: {
        ...devices["Desktop Chrome"],
        // Isolate the browser suite's rate-limit bucket from contract tests.
        extraHTTPHeaders: { "x-forwarded-for": "198.18.0.11" },
      },
    },
    {
      name: "mobile-chromium",
      testIgnore: /contract\//,
      use: {
        ...devices["Pixel 7"],
        extraHTTPHeaders: { "x-forwarded-for": "198.18.0.12" },
      },
    },
    {
      // Runs last: rate-limit checks must not trip the UI suites.
      name: "contract-api",
      testMatch: /contract[\\/].*\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build && npm start -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
