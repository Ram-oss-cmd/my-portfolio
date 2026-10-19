import { test, expect } from "@playwright/test";
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

test.describe("workbench terminal", () => {
  test("opens with / and answers the documented commands", async ({ page }) => {
    await openSite(page);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    await page.keyboard.press("/");
    const input = page.getByLabel("Terminal command");
    await expect(input).toBeFocused({ timeout: 3_000 });

    const run = async (command: string) => {
      await input.fill(command);
      await input.press("Enter");
    };

    await run("help");
    const log = page.getByRole("log", { name: /terminal output/i });
    await expect(log).toContainText("whoami");
    await expect(log).toContainText("projects");

    await run("whoami");
    await expect(log).toContainText(/Shreeram Chaudhary/);
    await expect(log).toContainText(/Linux: in service/i);

    await run("projects");
    await expect(log).toContainText("SHP-01");
    await expect(log).toContainText("IOT-04");

    await run("learning");
    await expect(log).toContainText(/IN PROGRESS/);
    await expect(log).toContainText(/Robotics/);

    await run("bogus-command");
    await expect(log).toContainText(
      "command not found: bogus-command. Type help.",
    );

    await run("clear");
    await expect(log.locator("p")).toHaveCount(0);
  });

  test("vba re-skins the terminal as the Immediate Window", async ({ page }) => {
    await openSite(page);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.keyboard.press("/");
    const input = page.getByLabel("Terminal command");
    await expect(input).toBeFocused({ timeout: 3_000 });

    await input.fill("vba");
    await input.press("Enter");
    await expect(page.locator(".terminal--vba")).toBeVisible();
    await expect(page.locator(".terminal__title")).toHaveText("Immediate");

    await input.fill("vba");
    await input.press("Enter");
    await expect(page.locator(".terminal--vba")).toHaveCount(0);
    await expect(page.locator(".terminal__title")).toHaveText(
      "shreeram@selang:~",
    );
  });

  test("contact command routes to the grid", async ({ page }) => {
    await openSite(page);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.keyboard.press("/");
    const input = page.getByLabel("Terminal command");
    await expect(input).toBeFocused({ timeout: 3_000 });

    await input.fill("contact");
    await input.press("Enter");

    await expect(
      page.getByRole("heading", { name: /power delivered/i }),
    ).toBeInViewport({ timeout: 5_000 });
  });

  test("Escape leaves the terminal and / returns to it", async ({ page }) => {
    await openSite(page);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.keyboard.press("/");
    const input = page.getByLabel("Terminal command");
    await expect(input).toBeFocused({ timeout: 3_000 });

    await input.press("Escape");
    await expect(input).not.toBeFocused();

    await page.keyboard.press("/");
    await expect(input).toBeFocused({ timeout: 3_000 });
  });
});
