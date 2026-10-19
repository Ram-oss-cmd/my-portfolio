import { expect, type Page, type Response } from "@playwright/test";

/** Opens the site and waits for the hero to be interactive. */
export async function openSite(page: Page): Promise<Response | null> {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => document.documentElement.classList.contains("app-ready"),
    undefined,
    { timeout: 20_000 },
  );
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /can.t afford to be sloppy/i,
    }),
  ).toBeVisible({ timeout: 20_000 });
  return response;
}

/** Opens the compact mobile navigation when the viewport shows the Menu button. */
export async function openMenuIfNeeded(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: /^menu$/i });
  if (await toggle.isVisible()) {
    await toggle.click();
  }
}
