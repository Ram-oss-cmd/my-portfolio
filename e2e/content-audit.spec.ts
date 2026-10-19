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
  test("credits the water cannon as hardware and software team work", async ({
    page,
  }) => {
    await openSite(page);

    const work = page.locator("#work");
    await expect(work.getByText(/team project/i).first()).toBeVisible();
    await expect(
      work.getByText(/descender flushing system \(RDF\)/i),
    ).toBeVisible();
    await expect(work.getByText(/Trishuli 3A Hydropower, Rasuwa/i)).toBeVisible();
    await expect(work.getByText(/60 MW/).first()).toBeVisible();
    await expect(work.getByText(/upload many motions/i)).toBeVisible();
    await expect(
      work.getByText(/manages the hydropower.s inventory/i),
    ).toBeVisible();
    await expect(page.getByText(/spray hose/i)).toHaveCount(0);
    await expect(
      work.getByText(/half of the automated water cannon control system/i),
    ).toBeVisible();
    await expect(
      work.getByText(/hardware and the software, mainly the hardware/i),
    ).toBeVisible();
    await expect(
      work.getByText(/client data and screenshots are not shown/i),
    ).toBeVisible();
    await expect(page.getByText(/made with|my role/i)).toHaveCount(0);
    await expect(page.locator("#stack")).toHaveCount(0);
    await expect(page.getByText(/interest engine/i)).toHaveCount(0);
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
    await expect(page.getByText(/Linux is home base/i)).toHaveCount(0);
    await expect(page.getByText(/running live on real plant data/i)).toBeVisible();
  });
});
