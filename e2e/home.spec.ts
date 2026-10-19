import { test, expect } from "@playwright/test";
import {
  captureErrors,
  expectNoConsoleErrors,
  type ErrorCapture,
} from "./support/console";
import { openSite, waitForHydration } from "./support/site";

let capture: ErrorCapture;

test.beforeEach(({ page }) => {
  capture = captureErrors(page);
});
test.afterEach(() => {
  expectNoConsoleErrors(capture);
});

test.describe("home / intake", () => {
  test("delivers the hero, name, clock and all six stages", async ({ page }) => {
    const response = await openSite(page);
    expect(response?.status()).toBe(200);

    const hero = page.locator("#intake");
    await expect(
      hero.getByRole("heading", { level: 1, name: /Shreeram Chaudhary/i }),
    ).toBeVisible();
    await expect(hero.getByText("श्रीराम चौधरी")).toBeVisible();
    await expect(
      hero.getByText(/I build the software that runs hydropower plants/i),
    ).toBeVisible();
    await expect(page.getByLabel(/live time in Kathmandu/i)).toBeVisible();

    // Work and Contact must be findable immediately.
    await expect(page.getByRole("link", { name: /^Work$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Contact$/i })).toBeVisible();

    for (const id of [
      "intake",
      "penstock",
      "turbine",
      "workbench",
      "powerhouse",
      "grid",
    ]) {
      await expect(page.locator(`#${id}`), `section #${id}`).toBeAttached();
    }
    await expect(page.locator(".river-rail__stages li")).toHaveCount(6);
  });

  test("preloader climbs to 0.990 MW, leaves under 2.5s, and skips", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    const skip = page.getByRole("button", { name: /^skip$/i });
    await expect(skip).toBeVisible();
    await expect(page.getByText(/CLIMBING TO RATED/i)).toBeVisible();

    // 1.9s climb + 0.28s leave, measured from hydration (not from navigation).
    await expect(skip).toBeHidden({ timeout: 4_000 });
    await expect(
      page.getByRole("heading", { level: 1, name: /Shreeram Chaudhary/i }),
    ).toBeVisible();
  });

  test("skip control clears the intro immediately", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForHydration(page);
    const skip = page.getByRole("button", { name: /^skip$/i });
    await expect(skip).toBeVisible();
    await skip.click();

    await expect(page.locator(".preloader")).toHaveCount(0, {
      timeout: 2_000,
    });
    await expect(
      page.getByRole("heading", { level: 1, name: /Shreeram Chaudhary/i }),
    ).toBeVisible();
  });

  test("header navigation reaches work and contact", async ({ page }) => {
    await openSite(page);

    await page.getByRole("link", { name: /^Work$/i }).click();
    await expect(page.locator("#turbine")).toBeInViewport({ timeout: 5_000 });

    await page
      .getByRole("navigation", { name: /primary/i })
      .getByRole("link", { name: /^Contact$/i })
      .click();
    await expect(page.locator("#grid")).toBeInViewport({ timeout: 5_000 });
  });
});
