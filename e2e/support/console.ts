import { expect, type Page } from "@playwright/test";

export type ErrorCapture = {
  errors: string[];
  /** Patterns for errors that are intentional in a given test (e.g. mocked 500s). */
  allow: RegExp[];
};

/** Collects console errors and uncaught page errors for a test. */
export function captureErrors(page: Page): ErrorCapture {
  const capture: ErrorCapture = { errors: [], allow: [] };

  page.on("console", (message) => {
    if (message.type() === "error") capture.errors.push(message.text());
  });
  page.on("pageerror", (error) => {
    capture.errors.push(`pageerror: ${error.message}`);
  });

  return capture;
}

export function expectNoConsoleErrors(capture: ErrorCapture): void {
  const unexpected = capture.errors.filter(
    (text) => !capture.allow.some((pattern) => pattern.test(text)),
  );
  expect(unexpected, "unexpected browser console/page errors").toEqual([]);
}
