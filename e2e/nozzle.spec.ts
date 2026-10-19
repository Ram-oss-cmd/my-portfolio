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

const controls = (page: Page) => page.locator("#nozzle-controls");
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

test.describe("Record / Replay", () => {
  test("records a path and replays it", async ({ page }) => {
    await openSite(page);

    await expect(
      controls(page).getByRole("button", { name: /^Record/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/idea behind the automated water cannon/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/up to 6 seconds/i).first()).toBeVisible();

    await controls(page).getByRole("button", { name: /^Record/i }).click();
    await expect(state(page)).toContainText(/Recording/);
    await expect(state(page)).toContainText(/6\.0s/);

    await recordSomeMotion(page);
    await controls(page).getByRole("button", { name: /^Record/i }).click();

    await expect(state(page)).toContainText(/Path ready/);
    const play = controls(page).getByRole("button", { name: /^Replay/i });
    await expect(play).toBeEnabled();
    await play.click();
    await expect(state(page)).toContainText(/Replaying/, { timeout: 1_500 });
  });

  test("R and P keys work outside text fields", async ({ page }) => {
    await openSite(page);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    await page.keyboard.press("r");
    await expect(state(page)).toContainText(/Recording/);

    await recordSomeMotion(page);
    await page.keyboard.press("r");
    await expect(state(page)).toContainText(/Path ready/);

    await page.keyboard.press("p");
    await expect(state(page)).toContainText(/Replaying/, { timeout: 1_500 });
  });

  test("the 6 second cap is advertised and ends recording", async ({ page }) => {
    await openSite(page);
    await controls(page).getByRole("button", { name: /^Record/i }).click();
    await expect(state(page)).toContainText(/6\.0s/);

    await controls(page).getByRole("button", { name: /^Record/i }).click();
    await expect(state(page)).not.toContainText(/Recording/);
  });

  test("touch users can operate the controls", async ({ page }) => {
    await openSite(page);
    await expect(
      controls(page).getByRole("button", { name: /^Record/i }),
    ).toBeVisible();
    await expect(
      controls(page).getByRole("button", { name: /^Replay/i }),
    ).toBeVisible();
  });
});
