import { test, expect } from "@playwright/test";
import {
  captureErrors,
  expectNoConsoleErrors,
  type ErrorCapture,
} from "./support/console";

let capture: ErrorCapture;

test.beforeEach(({ page }) => {
  capture = captureErrors(page);
  capture.allow.push(/404/i);
});
test.afterEach(() => {
  expectNoConsoleErrors(capture);
});

test.describe("custom 404", () => {
  test("shows the missing-page message and returns home", async ({ page }) => {
    const response = await page.goto("/qa-does-not-exist-404", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).toBe(404);
    await expect(page.getByText(/isn.t wired up/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /back to the portfolio/i }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: /back to the portfolio/i })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /can.t afford to be sloppy/i,
      }),
    ).toBeVisible({ timeout: 20_000 });
  });
});
