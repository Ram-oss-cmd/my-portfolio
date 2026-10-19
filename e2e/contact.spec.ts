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

const form = (page: import("@playwright/test").Page) =>
  page.locator("form.contact-form").first();

async function fillValid(page: import("@playwright/test").Page, tag: string) {
  await form(page).getByLabel("Name").fill(`QA Sample ${tag}`);
  await form(page)
    .getByLabel("Email")
    .fill(`qa-${tag}-${Date.now()}@example.com`);
  await form(page)
    .getByLabel("Message")
    .fill("Sample QA message for the portfolio contact form. Not client data.");
}

test.describe("contact form", () => {
  test("sends through the real endpoint and confirms receipt", async ({
    page,
  }) => {
    await openSite(page);
    await page
      .getByRole("heading", { name: /have something worth building/i })
      .scrollIntoViewIfNeeded();
    await fillValid(page, `${test.info().project.name}`);

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/contact") &&
        response.request().method() === "POST",
    );
    await form(page).getByRole("button", { name: /send message/i }).click();
    const response = await responsePromise;

    expect(response.status()).toBe(201);
    const body = response.request().postDataJSON();
    expect(body).toMatchObject({
      name: expect.stringMatching(/^QA Sample/),
      email: expect.stringContaining("@example.com"),
      message: expect.stringContaining("Sample QA message"),
    });

    await expect(
      page.getByRole("status").filter({ hasText: /message received/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("keeps the honeypot hidden from real users", async ({ page }) => {
    await openSite(page);
    const honeypot = page.locator('input[name="website"]');
    if (await honeypot.count()) {
      await expect(honeypot.first()).toBeHidden();
      await expect(honeypot.first()).toHaveAttribute("tabindex", "-1");
    }
  });

  test("validates empty fields without sending", async ({ page }) => {
    await openSite(page);
    let posts = 0;
    page.on("request", (request) => {
      if (
        request.url().includes("/api/contact") &&
        request.method() === "POST"
      ) {
        posts += 1;
      }
    });

    await form(page).getByRole("button", { name: /send message/i }).click();

    await expect(page.getByText(/enter your name/i)).toBeVisible();
    await expect(page.getByText(/enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/tell me a little more/i)).toBeVisible();
    expect(posts).toBe(0);
  });

  test("shows a safe error when the API fails", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "STORAGE_ERROR",
            message: "Could not save your message. Please try again.",
          },
        }),
      }),
    );
    capture.allow.push(/Failed to load resource/i, /500/i);

    await openSite(page);
    await fillValid(page, "error");
    await form(page).getByRole("button", { name: /send message/i }).click();

    await expect(form(page).getByRole("alert")).toBeVisible();
    await expect(form(page).getByRole("alert")).toContainText(/try again/i);
  });

  test("shows a safe error when rate limited", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
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
    await fillValid(page, "ratelimit");
    await form(page).getByRole("button", { name: /send message/i }).click();

    await expect(form(page).getByRole("alert")).toBeVisible();
  });
});
