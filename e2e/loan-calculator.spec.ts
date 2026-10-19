import { test, expect } from "@playwright/test";
import { calculateLoan } from "../tests/support/loan-math";
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

const loan = (page: import("@playwright/test").Page) =>
  page.locator(".loan").first();

async function fillSample(
  page: import("@playwright/test").Page,
  principal: number,
  rate: number,
  months: number,
) {
  await loan(page).getByLabel(/^principal$/i).fill(String(principal));
  await loan(page).getByLabel(/annual interest/i).fill(String(rate));
  await loan(page).getByLabel(/^months$/i).fill(String(months));
}

async function chooseReducing(page: import("@playwright/test").Page) {
  const radio = page.getByRole("radio", { name: /reducing/i });
  if (await radio.count()) {
    await radio.first().check();
    return;
  }
  const combobox = page.getByRole("combobox", { name: /method|type/i });
  if (await combobox.count()) {
    await combobox.first().selectOption("reducing");
  }
}

test.describe("loan calculator (sample data)", () => {
  test("calls the real API and shows the reducing-balance numbers", async ({
    page,
  }) => {
    await openSite(page);
    await expect(
      page.getByText(/sample data, not client data/i).first(),
    ).toBeVisible();

    const expected = calculateLoan({
      principal: 250_000,
      annualRatePercent: 12.5,
      months: 24,
      method: "reducing",
    });

    await fillSample(page, 250_000, 12.5, 24);
    await chooseReducing(page);

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/loan-estimate") &&
        response.request().method() === "POST",
    );
    await loan(page).getByRole("button", { name: /^calculate/i }).click();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(response.request().postDataJSON()).toEqual({
      principal: 250_000,
      annualRatePercent: 12.5,
      months: 24,
      method: "reducing",
    });

    const result = loan(page).locator(".loan__result");
    await expect(result).toContainText("11,826.83");
    await expect(result).toContainText("33,843.87");
    await expect(result).toContainText("283,843.87");
    expect(expected.totalPayable).toBe(283_843.87);
  });

  test("handles zero interest", async ({ page }) => {
    await openSite(page);
    await fillSample(page, 250_000, 0, 24);
    await chooseReducing(page);

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/loan-estimate") &&
        response.request().method() === "POST",
    );
    await loan(page).getByRole("button", { name: /^calculate/i }).click();
    expect((await responsePromise).status()).toBe(200);

    const result = loan(page).locator(".loan__result");
    await expect(result).toContainText("10,416.67");
    await expect(result).toContainText(/total interest/i);
    await expect(result).toContainText("NPR 0.00");
  });

  test("validates out-of-range sample input before calling the API", async ({
    page,
  }) => {
    await openSite(page);
    let outOfRangeRequests = 0;
    page.on("request", (request) => {
      if (
        request.url().includes("/api/loan-estimate") &&
        request.postData()?.includes("2000000000")
      ) {
        outOfRangeRequests += 1;
      }
    });

    await fillSample(page, 2_000_000_000, 12.5, 24);
    await loan(page).getByRole("button", { name: /^calculate/i }).click();

    await expect(
      page.getByText(/keep the sample under NPR 1,000,000,000/i),
    ).toBeVisible();
    expect(outOfRangeRequests).toBe(0);
  });

  test("shows a safe error when the API fails", async ({ page }) => {
    await page.route("**/api/loan-estimate", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "INTERNAL_ERROR",
            message: "Something went wrong. Please try again.",
          },
        }),
      }),
    );
    capture.allow.push(/Failed to load resource/i, /500/i);

    await openSite(page);
    await fillSample(page, 250_000, 12.5, 24);
    await chooseReducing(page);
    await loan(page).getByRole("button", { name: /^calculate/i }).click();

    await expect(loan(page).getByRole("alert")).toBeVisible();
    await expect(loan(page).getByRole("alert")).not.toBeEmpty();
  });

  test("shows a safe error when rate limited", async ({ page }) => {
    await page.route("**/api/loan-estimate", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Try again later.",
            retryAfterSeconds: 30,
          },
        }),
      }),
    );
    capture.allow.push(/Failed to load resource/i, /429/i);

    await openSite(page);
    await fillSample(page, 250_000, 12.5, 24);
    await chooseReducing(page);
    await loan(page).getByRole("button", { name: /^calculate/i }).click();

    await expect(loan(page).getByRole("alert")).toBeVisible();
  });
});
