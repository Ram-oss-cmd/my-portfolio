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

test.describe("content honesty", () => {
  test("labels sample loan data and credits the team project", async ({
    page,
  }) => {
    await openSite(page);

    await expect(
      page.getByText(/sample data, not client data/i).first(),
    ).toBeVisible();

    const work = page.locator("#work");
    await expect(work.getByText(/team project/i).first()).toBeVisible();
    await expect(
      work.getByText(/software side|did not build it alone/i).first(),
    ).toBeVisible();

    const stack = page.locator("#stack");
    await expect(stack.getByText(/learning now/i)).toBeVisible();
    await expect(stack.getByText(/Python, AI, Robotics/)).toBeVisible();
  });

  test("contains no invented social proof or statistics", async ({ page }) => {
    await openSite(page);

    const text = await page.locator("body").innerText();
    const forbidden = [
      /trusted by/i,
      /testimonial/i,
      /award-winning/i,
      /\b\d{3}\+ (?:clients|projects|customers)\b/i,
      /5-star/i,
      /fortune 500/i,
      /100% satisfaction/i,
      /\$\d+[mk]\+? (?:saved|revenue|raised)/i,
    ];

    const found = forbidden.filter((pattern) => pattern.test(text));
    expect(found.map(String)).toEqual([]);
  });

  test("shows the plant output once, the real email, and no CV", async ({
    page,
  }) => {
    await openSite(page);

    await expect(page.getByText("0.990 MW")).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: "rc.cloop@gmail.com" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /download cv/i }),
    ).toHaveCount(0);
    await expect(page.getByText(/Linux is home base/i)).toBeVisible();
  });
});
