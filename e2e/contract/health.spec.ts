import { test, expect } from "@playwright/test";
import packageJson from "../../package.json";
import { uniqueIp } from "./helpers";

test.describe("contract: GET /api/health", () => {
  test("returns the documented liveness payload", async ({ request }) => {
    const response = await request.get("/api/health", { headers: uniqueIp() });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(
      /^application\/json; charset=utf-8$/,
    );
    expect(response.headers()["cache-control"]).toBe("no-store");

    const body = await response.json();
    expect(body).toMatchObject({
      status: "ok",
      service: "shreeram-portfolio",
      version: packageJson.version,
      timestamp: expect.any(String),
    });

    const timestamp = Date.parse(body.timestamp);
    expect(Number.isNaN(timestamp)).toBe(false);
    expect(Math.abs(Date.now() - timestamp)).toBeLessThan(60_000);
  });

  test("is evaluated per request, not cached", async ({ request }) => {
    const first = await request.get("/api/health", { headers: uniqueIp() });
    const second = await request.get("/api/health", { headers: uniqueIp() });

    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
    expect(first.headers()["cache-control"]).toBe("no-store");
  });

  test("unsupported methods return framework 405 with an empty body", async ({
    request,
  }) => {
    const response = await request.post("/api/health", {
      headers: uniqueIp(),
      data: {},
    });

    // Contract v1 amendment (backend CHANGE_REQUEST, QA ACK): no Allow header.
    expect(response.status()).toBe(405);
    expect(response.headers()["allow"]).toBeUndefined();
    expect((await response.body()).length).toBe(0);
  });
});
