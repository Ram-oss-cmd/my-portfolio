import { test, expect } from "@playwright/test";
import {
  expectErrorEnvelope,
  findStoredRecord,
  fixedIp,
  uniqueIp,
  UUID_V4,
} from "./helpers";

const validBody = {
  name: "QA Sample",
  email: "qa-sample@example.com",
  message: "Contract test message. Sample only, not client data.",
  website: "",
};

test.describe("contract: POST /api/contact", () => {
  test("stores a valid submission and returns 201 {ok,id}", async ({
    request,
  }) => {
    const email = `qa-${Date.now()}@example.com`;
    const message = "Contract test message. Sample only, not client data.";
    const response = await request.post("/api/contact", {
      headers: uniqueIp(),
      data: { ...validBody, email, message },
    });

    expect(response.status()).toBe(201);
    expect(response.headers()["content-type"]).toMatch(
      /^application\/json; charset=utf-8$/,
    );
    expect(response.headers()["cache-control"]).toBe("no-store");

    const body = await response.json();
    expect(body).toEqual({ ok: true, id: expect.stringMatching(UUID_V4) });

    const record = await findStoredRecord(body.id);
    expect(record).not.toBeNull();
    expect(record).toEqual({
      id: body.id,
      receivedAt: expect.any(String),
      name: validBody.name,
      email,
      message,
    });
    expect(Number.isNaN(Date.parse(String(record?.receivedAt)))).toBe(false);
  });

  test("silently accepts honeypot fills without storing them", async ({
    request,
  }) => {
    const email = `qa-honeypot-${Date.now()}@example.com`;
    const response = await request.post("/api/contact", {
      headers: uniqueIp(),
      data: { ...validBody, email, website: "https://spam.example" },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toEqual({ ok: true, id: expect.stringMatching(UUID_V4) });
    expect(await findStoredRecord(body.id)).toBeNull();
  });

  test("reports every invalid field in the error envelope", async ({
    request,
  }) => {
    const response = await request.post("/api/contact", {
      headers: uniqueIp(),
      data: { name: "", email: "not-an-email", message: "short" },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()["cache-control"]).toBe("no-store");
    const body = await response.json();
    expectErrorEnvelope(body, "VALIDATION_ERROR");
    expect(body.error.fields).toHaveProperty("name");
    expect(body.error.fields).toHaveProperty("email");
    expect(body.error.fields).toHaveProperty("message");
  });

  test("enforces name, email and message limits", async ({ request }) => {
    const cases: Array<{ data: Record<string, unknown>; field: string }> = [
      { data: { ...validBody, name: "n".repeat(101) }, field: "name" },
      { data: { ...validBody, email: `${"a".repeat(243)}@example.com` }, field: "email" },
      { data: { ...validBody, message: "m".repeat(5_001) }, field: "message" },
      { data: { ...validBody, website: "w".repeat(201) }, field: "website" },
    ];

    for (const { data, field } of cases) {
      const response = await request.post("/api/contact", {
        headers: uniqueIp(),
        data,
      });
      expect(response.status(), field).toBe(400);
      const body = await response.json();
      expectErrorEnvelope(body, "VALIDATION_ERROR");
      expect(body.error.fields, field).toHaveProperty(field);
    }
  });

  test("accepts boundary-length fields", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: uniqueIp(),
      data: {
        name: "n".repeat(100),
        email: `${"a".repeat(242)}@example.com`,
        message: "m".repeat(5_000),
        website: "",
      },
    });

    expect(response.status()).toBe(201);
  });

  test("rejects unknown top-level keys", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: uniqueIp(),
      data: { ...validBody, extra: true },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expectErrorEnvelope(body, "VALIDATION_ERROR");
    expect(body.error.fields).toHaveProperty("_root");
  });

  test("rejects malformed and empty JSON with INVALID_JSON", async ({
    request,
  }) => {
    // Buffer bodies are sent raw; Playwright would JSON-encode a plain string.
    for (const data of [Buffer.from("{"), Buffer.from("")]) {
      const response = await request.post("/api/contact", {
        headers: { ...uniqueIp(), "content-type": "application/json" },
        data,
      });
      expect(response.status()).toBe(400);
      expectErrorEnvelope(await response.json(), "INVALID_JSON");
    }
  });

  test("rejects non-JSON content types with 415", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: uniqueIp(),
      form: { name: "QA", email: "qa@example.com", message: "Sample message body" },
    });

    expect(response.status()).toBe(415);
    expectErrorEnvelope(await response.json(), "UNSUPPORTED_MEDIA_TYPE");
  });

  test("rejects bodies over 16 KiB with 413", async ({ request }) => {
    const oversized = `${JSON.stringify(validBody)}${" ".repeat(17_000)}`;
    const response = await request.post("/api/contact", {
      headers: { ...uniqueIp(), "content-type": "application/json" },
      data: oversized,
    });

    expect(response.status()).toBe(413);
    expectErrorEnvelope(await response.json(), "PAYLOAD_TOO_LARGE");
  });

  test("unsupported methods return framework 405 with an empty body", async ({
    request,
  }) => {
    const response = await request.get("/api/contact", {
      headers: uniqueIp(),
    });

    // Contract v1 amendment (backend CHANGE_REQUEST, QA ACK): no Allow header.
    expect(response.status()).toBe(405);
    expect(response.headers()["allow"]).toBeUndefined();
    expect((await response.body()).length).toBe(0);
  });

  test("rate limits after 5 requests in the window", async ({ request }) => {
    const headers = fixedIp();
    for (let i = 0; i < 5; i += 1) {
      const response = await request.post("/api/contact", {
        headers: { ...headers, "content-type": "application/json" },
        data: "{",
      });
      expect(response.status()).toBe(400);
    }

    const limited = await request.post("/api/contact", {
      headers,
      data: validBody,
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
