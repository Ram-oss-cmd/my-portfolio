import AxeBuilder from "@axe-core/playwright";
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

test.describe("accessibility", () => {
  test("has no serious or critical axe violations", async ({ page }) => {
    await openSite(page);
    await page.waitForTimeout(400);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );

    expect(
      serious.map(
        (violation) =>
          `${violation.id} (${violation.impact}): ${violation.help} -> ${violation.nodes
            .map((node) => node.target.join(" "))
            .join(" | ")}`,
      ),
    ).toEqual([]);
  });

  test("uses one h1, a main landmark and a labelled nav", async ({ page }) => {
    await openSite(page);
    await openMenuIfNeeded(page);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(
      page.getByRole("navigation", { name: /primary/i }),
    ).toBeVisible();
  });

  test("skip link is the first tab stop and jumps into the page", async ({
    page,
  }) => {
    await openSite(page);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    const skip = page.getByRole("link", { name: /skip/i });
    if ((await skip.count()) === 0) {
      // Surface a precise failure instead of a confusing focus assertion.
      expect(skip, "missing skip link").toHaveCount(1);
      return;
    }

    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();

    await page.keyboard.press("Enter");
    const after = await page.evaluate(() => ({
      hash: window.location.hash,
      tag: document.activeElement?.tagName,
      id: document.activeElement?.id,
    }));
    expect(
      after.hash.length > 0 ||
        after.tag === "MAIN" ||
        after.id === "main" ||
        after.id === "content",
      JSON.stringify(after),
    ).toBe(true);
  });
});
