import { expect, type Page, type Response } from "@playwright/test";

/**
 * Opens the site and clears the intro so tests start on usable content.
 * Returns the navigation response so callers can assert the status.
 */
export async function openSite(page: Page): Promise<Response | null> {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });

  // The preloader only leaves once React has hydrated and its effects have run.
  await expect(page.locator(".preloader")).toHaveCount(0, { timeout: 20_000 });
  await expect(
    page.getByRole("heading", { level: 1, name: /Shreeram Chaudhary/i }),
  ).toBeVisible();

  return response;
}

/** Waits until the intro's effects are live, so clicks are not lost pre-hydration. */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.documentElement.classList.contains("is-preloading"),
    undefined,
    { timeout: 20_000 },
  );
}

/** Scrolls a section into view by its visible text without relying on ids. */
export async function reveal(page: Page, text: RegExp): Promise<void> {
  const target = page.getByText(text).first();
  await target.scrollIntoViewIfNeeded();
}

/**
 * Brings a pinned turbine station into view. On unpinned layouts every station
 * is already in the flow, so this only waits for the station to exist.
 */
export async function showStation(page: Page, tag: string): Promise<void> {
  if (await page.locator(".turbine.is-pinned").count()) {
    await page.evaluate((tag) => {
      const scroller = document.querySelector<HTMLElement>(".turbine__scroll");
      if (!scroller) return;
      const stations = Array.from(scroller.querySelectorAll(".station"));
      const index = stations.findIndex((station) =>
        station.textContent?.includes(tag),
      );
      if (index < 0) return;
      const start = scroller.getBoundingClientRect().top + window.scrollY;
      const span = scroller.offsetHeight - window.innerHeight;
      window.scrollTo(0, start + span * ((index + 0.5) / stations.length));
    }, tag);
  }
  await expect(page.locator(".station", { hasText: tag })).toBeVisible();
}
