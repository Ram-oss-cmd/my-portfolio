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
  test("opens without an intro and with all content visible", async ({
    page,
  }) => {
    const started = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /can.t afford to be sloppy/i,
      }),
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

    const hiddenReveals = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
          (element) => getComputedStyle(element).opacity === "0",
        ).length,
    );
    expect(hiddenReveals).toBe(0);
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

  test("record and replay remain usable", async ({ page }) => {
    await openSite(page);
    const controls = page.locator("#nozzle-controls");
    const record = controls.getByRole("button", { name: /^Record/i });

    await record.click();
    await page.mouse.move(240, 320);
    await page.mouse.move(320, 360);
    await page.mouse.move(420, 340);
    await record.click();

    const replay = controls.getByRole("button", { name: /^Replay/i });
    await expect(replay).toBeEnabled();
    await replay.click();
    await expect(controls.locator(".nozzle-state")).toContainText(/Replaying/);
  });
});
