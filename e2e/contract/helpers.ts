import { expect } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";

let ipCounter = 0;

/** Each test gets its own rate-limit bucket by sending a unique client IP. */
export function uniqueIp(): Record<string, string> {
  ipCounter += 1;
  return { "x-forwarded-for": `198.51.100.${(ipCounter % 250) + 1}` };
}

/** One IP shared by every request in a test (for rate-limit checks). */
export function fixedIp(): Record<string, string> {
  ipCounter += 1;
  return { "x-forwarded-for": `203.0.113.${(ipCounter % 250) + 1}` };
}

export function expectErrorEnvelope(
  body: unknown,
  code: string,
): asserts body is {
  error: { code: string; message: string; fields?: Record<string, string> };
} {
  expect(body).toMatchObject({
    error: { code, message: expect.any(String) },
  });
  const envelope = (body as { error: { message: string } }).error;
  expect(envelope.message.length).toBeGreaterThan(0);
}

export const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function messagesFile(): string {
  return path.join(process.cwd(), "data", "messages.jsonl");
}

/** Poll the runtime log until the id appears (file append is async on disk). */
export async function findStoredRecord(id: string): Promise<Record<string, unknown> | null> {
  const file = messagesFile();
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const line = raw
        .split(/\r?\n/)
        .reverse()
        .find((entry) => entry.includes(id));
      if (line) return JSON.parse(line) as Record<string, unknown>;
    } catch {
      // file may not exist yet
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return null;
}
