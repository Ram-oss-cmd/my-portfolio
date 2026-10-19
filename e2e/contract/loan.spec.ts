import { test, expect } from "@playwright/test";
import { calculateLoan, type LoanInput } from "../../tests/support/loan-math";
import { expectErrorEnvelope, fixedIp, uniqueIp } from "./helpers";

const validBody = (
  overrides: Partial<LoanInput> = {},
): LoanInput => ({
  principal: 250_000,
  annualRatePercent: 12.5,
  months: 24,
  method: "reducing",
  ...overrides,
});

test.describe("contract: POST /api/loan-estimate", () => {
  test("worked example A (simple, sample data) matches independent math", async ({
    request,
  }) => {
    const input = validBody({ method: "simple" });
    const response = await request.post("/api/loan-estimate", {
      headers: uniqueIp(),
      data: input,
    });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(
      /^application\/json; charset=utf-8$/,
    );
    expect(response.headers()["cache-control"]).toBe("no-store");
    expect(await response.json()).toEqual(calculateLoan(input));
  });

  test("worked example B (reducing, sample data) matches independent math", async ({
    request,
  }) => {
    const input = validBody();
    const response = await request.post("/api/loan-estimate", {
      headers: uniqueIp(),
      data: input,
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(calculateLoan(input));
  });

  test("worked example C (zero interest, sample data) matches independent math", async ({
    request,
  }) => {
    const input = validBody({ annualRatePercent: 0 });
    const response = await request.post("/api/loan-estimate", {
      headers: uniqueIp(),
      data: input,
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(calculateLoan(input));
  });

  test("accepts the documented boundaries", async ({ request }) => {
    const maxInput = validBody({
      principal: 1_000_000_000,
      annualRatePercent: 100,
      months: 360,
      method: "simple",
    });
    const response = await request.post("/api/loan-estimate", {
      headers: uniqueIp(),
      data: maxInput,
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(calculateLoan(maxInput));
  });

  test("rejects out-of-range and mistyped values with field errors", async ({
    request,
  }) => {
    const cases: Array<{ override: Record<string, unknown>; field: string }> = [
      { override: { months: 0 }, field: "months" },
      { override: { months: 361 }, field: "months" },
      { override: { months: 1.5 }, field: "months" },
      { override: { principal: 0 }, field: "principal" },
      { override: { principal: 1_000_000_001 }, field: "principal" },
      { override: { principal: "250000" }, field: "principal" },
      { override: { annualRatePercent: -1 }, field: "annualRatePercent" },
      { override: { annualRatePercent: 101 }, field: "annualRatePercent" },
      { override: { method: "flat" }, field: "method" },
    ];

    for (const { override, field } of cases) {
      const response = await request.post("/api/loan-estimate", {
        headers: uniqueIp(),
        data: { ...validBody(), ...override },
      });
      expect(response.status(), JSON.stringify(override)).toBe(400);
      expect(response.headers()["cache-control"]).toBe("no-store");
      const body = await response.json();
      expectErrorEnvelope(body, "VALIDATION_ERROR");
      expect(body.error.fields, JSON.stringify(override)).toHaveProperty(field);
    }
  });

  test("rejects unknown top-level keys", async ({ request }) => {
    const response = await request.post("/api/loan-estimate", {
      headers: uniqueIp(),
      data: { ...validBody(), extra: true },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expectErrorEnvelope(body, "VALIDATION_ERROR");
    expect(body.error.fields).toHaveProperty("_root");
  });

  test("rejects malformed and empty JSON", async ({ request }) => {
    // Buffer bodies are sent raw; Playwright would JSON-encode a plain string.
    for (const data of [Buffer.from("{"), Buffer.from("")]) {
      const response = await request.post("/api/loan-estimate", {
        headers: { ...uniqueIp(), "content-type": "application/json" },
        data,
      });
      expect(response.status()).toBe(400);
      expectErrorEnvelope(await response.json(), "INVALID_JSON");
    }
  });

  test("rejects non-JSON content types with 415", async ({ request }) => {
    const response = await request.post("/api/loan-estimate", {
      headers: uniqueIp(),
      form: { principal: "250000", months: "24" },
    });

    expect(response.status()).toBe(415);
    expectErrorEnvelope(await response.json(), "UNSUPPORTED_MEDIA_TYPE");
  });

  test("rejects bodies over 16 KiB with 413", async ({ request }) => {
    const oversized = `${JSON.stringify(validBody())}${" ".repeat(17_000)}`;
    const response = await request.post("/api/loan-estimate", {
      headers: { ...uniqueIp(), "content-type": "application/json" },
      data: oversized,
    });

    expect(response.status()).toBe(413);
    expectErrorEnvelope(await response.json(), "PAYLOAD_TOO_LARGE");
  });

  test("unsupported methods return framework 405 with an empty body", async ({
    request,
  }) => {
    const response = await request.get("/api/loan-estimate", {
      headers: uniqueIp(),
    });

    // Contract v1 amendment (backend CHANGE_REQUEST, QA ACK): no Allow header.
    expect(response.status()).toBe(405);
    expect(response.headers()["allow"]).toBeUndefined();
    expect((await response.body()).length).toBe(0);
  });

  test("rate limits after 30 requests in the window", async ({ request }) => {
    const headers = fixedIp();
    for (let i = 0; i < 30; i += 1) {
      const response = await request.post("/api/loan-estimate", {
        headers: { ...headers, "content-type": "application/json" },
        data: "{",
      });
      expect(response.status()).toBe(400);
    }

    const limited = await request.post("/api/loan-estimate", {
      headers,
      data: validBody(),
    });

    expect(limited.status()).toBe(429);
    expect(limited.headers()["cache-control"]).toBe("no-store");
    const retryAfter = Number(limited.headers()["retry-after"]);
    expect(retryAfter).toBeGreaterThanOrEqual(1);
    expect(retryAfter).toBeLessThanOrEqual(60);

    const body = await limited.json();
    expectErrorEnvelope(body, "RATE_LIMITED");
    expect(
      (body as { error: { retryAfterSeconds?: number } }).error
        .retryAfterSeconds,
    ).toBe(retryAfter);
  });
});
