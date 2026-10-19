import { test, expect } from "@playwright/test";
import {
  captureErrors,
  expectNoConsoleErrors,
  type ErrorCapture,
} from "./support/console";
import { openSite, showStation } from "./support/site";

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

    await showStation(page, "TMK-03");
    await expect(
      page.getByText(/sample data, not client data/i).first(),
    ).toBeVisible();

    const turbine = page.locator("#turbine");
    await showStation(page, "IOT-04");
    await expect(turbine.getByText(/team project/i).first()).toBeVisible();
    await expect(
      turbine.getByText(/I did not build it alone|I contributed/i).first(),
    ).toBeVisible();

    // Learning items are explicitly in progress, with no claimed certificates.
    await expect(page.locator("#workbench").getByText(/IN PROGRESS/)).toHaveCount(
      3,
    );
  });

  test("contains no invented social proof or statistics", async ({ page }) => {
    await openSite(page);
    await page
      .getByRole("heading", { name: /power delivered/i })
      .scrollIntoViewIfNeeded();

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

  test("shows the real plant output and no fabricated metrics", async ({
    page,
  }) => {
    await openSite(page);
    await expect(
      page.getByText("0.990 MW").filter({ visible: true }).first(),
    ).toBeVisible();

    const meter = page.getByRole("meter", {
      name: /plant output in megawatts/i,
    });
    await meter.scrollIntoViewIfNeeded();
    await expect(meter).toBeVisible();
    await expect
      .poll(async () => Number(await meter.getAttribute("aria-valuenow")), {
        timeout: 5_000,
      })
      .toBeGreaterThan(0);
  });
});
