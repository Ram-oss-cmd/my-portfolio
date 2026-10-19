import { test, expect } from "@playwright/test";
import {
  captureErrors,
  expectNoConsoleErrors,
  type ErrorCapture,
} from "./support/console";
import { openSite } from "./support/site";

test.use({ reducedMotion: "reduce" });

let capture: ErrorCapture;

test.beforeEach(({ page }) => {
  capture = captureErrors(page);
});
test.afterEach(() => {
  expectNoConsoleErrors(capture);
});

test.describe("prefers-reduced-motion", () => {
  test("opens without the animated intro and with usable controls", async ({
    page,
  }) => {
    const started = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: /Shreeram Chaudhary/i }),
    ).toBeVisible({ timeout: 3_000 });
    expect(Date.now() - started).toBeLessThan(4_000);

    await expect(page.getByRole("button", { name: /^skip$/i })).toHaveCount(0, {
      timeout: 2_000,
    });
    expect(
      await page.evaluate(() =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(true);
  });

  test("has no infinite running animations", async ({ page }) => {
    await openSite(page);

    const infinite = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => {
          const timing = animation.effect?.getTiming();
          return (
            animation.playState === "running" && timing?.iterations === Infinity
          );
        })
        .map((animation) => animation.id || animation.constructor.name),
    );

    expect(infinite).toEqual([]);
  });

  test("terminal opens instantly and nozzle controls remain available", async ({
    page,
  }) => {
    await openSite(page);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    await page.keyboard.press("/");
    await expect(page.getByLabel("Terminal command")).toBeFocused({
      timeout: 1_500,
    });

    await expect(
      page
        .locator("#nozzle-hero-controls")
        .getByRole("button", { name: /^REC/i }),
    ).toBeVisible();
  });
});
