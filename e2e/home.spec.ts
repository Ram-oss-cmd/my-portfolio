import { test, expect } from "@playwright/test";
import {
  captureErrors,
  expectNoConsoleErrors,
  type ErrorCapture,
} from "./support/console";
import { openMenuIfNeeded, openSite } from "./support/site";

let capture: ErrorCapture;

test.beforeEach(({ page }) => {
  capture = captureErrors(page);
});
test.afterEach(() => {
  expectNoConsoleErrors(capture);
});

test.describe("home", () => {
  test("delivers the hero, name, sections and real work images", async ({
    page,
  }) => {
    const response = await openSite(page);
    expect(response?.status()).toBe(200);

    const hero = page.locator("#top");
    await expect(
      hero.getByRole("heading", { level: 1 }),
    ).toContainText(/can.t afford to be sloppy/i);
    await expect(hero.getByText("श्रीराम चौधरी")).toBeVisible();
    await expect(hero.getByText(/Shreeram Chaudhary/i)).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /explore my work/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /get in touch/i })).toBeVisible();

    for (const id of ["about", "work", "contact"]) {
      await expect(page.locator(`#${id}`), `section #${id}`).toBeAttached();
    }

    const selang = page.getByAltText(/hydropower management dashboard/i);
    await selang.scrollIntoViewIfNeeded();
    await expect(selang).toBeVisible();
    await expect
      .poll(async () => selang.evaluate((img) => (img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);

    const ledger = page.getByAltText(/ledger app for abhiyan/i);
    await ledger.scrollIntoViewIfNeeded();
    await expect(ledger).toBeVisible();
    await expect
      .poll(async () => ledger.evaluate((img) => (img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);

    const cannon = page.getByAltText(/automated water cannon: a red motorised/i);
    await cannon.scrollIntoViewIfNeeded();
    await expect(cannon).toBeVisible();
    await expect
      .poll(async () => cannon.evaluate((img) => (img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  });

  test("header navigation reaches work and contact", async ({ page }) => {
    await openSite(page);

    await openMenuIfNeeded(page);
    await page
      .getByRole("navigation", { name: /primary/i })
      .getByRole("link", { name: /^Work$/i })
      .click();
    await expect(page.locator("#work")).toBeInViewport({ timeout: 8_000 });

    await openMenuIfNeeded(page);
    await page
      .getByRole("navigation", { name: /primary/i })
      .getByRole("link", { name: /^Contact$/i })
      .click();
    await expect(page.locator("#contact")).toBeInViewport({ timeout: 8_000 });
  });

  test("has no loading screen and no CV download", async ({ page }) => {
    await openSite(page);
    await expect(page.locator(".preloader")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /download cv/i }),
    ).toHaveCount(0);
  });
});
