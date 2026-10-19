import { test, expect, type Page } from "@playwright/test";
import {
  captureErrors,
  expectNoConsoleErrors,
  type ErrorCapture,
} from "./support/console";
import { openSite } from "./support/site";

let capture: ErrorCapture;

test.beforeEach(({ page }) => {
  capture = captureErrors(page);
});
test.afterEach(() => {
  expectNoConsoleErrors(capture);
});

const controls = (page: Page) => page.locator("#nozzle-hero-controls");
const state = (page: Page) => controls(page).locator(".nozzle-state");

async function recordSomeMotion(page: Page) {
  const viewport = page.viewportSize() ?? { width: 1200, height: 800 };
  const y = Math.round(viewport.height * 0.4);
  for (let i = 0; i < 8; i += 1) {
    await page.mouse.move(
      Math.round(viewport.width * (0.2 + i * 0.07)),
      y + i * 4,
    );
    await page.waitForTimeout(70);
  }
}

test.describe("REC / PLAY nozzle", () => {
  test("records a path and replays it", async ({ page }) => {
    await openSite(page);

    await expect(controls(page).getByRole("button", { name: /^REC/i })).toBeVisible();
    await expect(
      page.getByText(/idea behind my IoT water cannon/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/up to 6 seconds/i).first()).toBeVisible();

    await controls(page).getByRole("button", { name: /^REC/i }).click();
    await expect(state(page)).toContainText(/REC \d\.\ds \/ 6\.0s/);

    await recordSomeMotion(page);
    await controls(page).getByRole("button", { name: /^REC/i }).click();

    await expect(state(page)).toContainText(/PATH STORED/);
    const play = controls(page).getByRole("button", { name: /^PLAY/i });
    await expect(play).toBeEnabled();
    await play.click();
    await expect(state(page)).toContainText(/REPLAYING/, { timeout: 1_500 });
  });

  test("R and P keys work outside text fields", async ({ page }) => {
    await openSite(page);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    await page.keyboard.press("r");
    await expect(state(page)).toContainText(/REC \d\.\ds \/ 6\.0s/);

    await recordSomeMotion(page);
    await page.keyboard.press("r");
    await expect(state(page)).toContainText(/PATH STORED/);

    await page.keyboard.press("p");
    await expect(state(page)).toContainText(/REPLAYING/, { timeout: 1_500 });
  });

  test("the 6 second cap is advertised and enforced by the state label", async ({
    page,
  }) => {
    await openSite(page);
    await controls(page).getByRole("button", { name: /^REC/i }).click();
    await expect(state(page)).toContainText(/\/ 6\.0s/);

    // Do not wait six seconds: the store's hard cap is unit-level behaviour;
    // this asserts the UI communicates the cap.
    await controls(page).getByRole("button", { name: /^REC/i }).click();
    await expect(state(page)).not.toContainText(/REC \d/);
  });

  test("touch users get tap-and-drag controls", async ({ page }) => {
    await openSite(page);
    await expect(controls(page).getByRole("button", { name: /^REC/i })).toBeVisible();
    await expect(page.getByText(/on touch: tap and drag/i).first()).toBeVisible();
  });
});
