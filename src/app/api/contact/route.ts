import { z } from "zod";
import { clientIp, errorResponse, jsonResponse, readJsonBody, validationError } from "@/lib/server/http";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { appendMessage, forwardContactEmail } from "@/lib/server/messages";

const contactSchema = z.strictObject({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .max(254, "Email must be at most 254 characters")
    .pipe(z.email("Invalid email address")),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5_000, "Message must be at most 5000 characters"),
  website: z.string().trim().max(200, "Website must be at most 200 characters").optional().default(""),
});

export async function POST(request: Request) {
  try {
    const limit = checkRateLimit("contact", clientIp(request), 5);
    if (!limit.allowed) {
      return errorResponse(429, "RATE_LIMITED", "Too many requests. Try again later.", {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    const body = await readJsonBody(request);
    if (!body.ok) return body.response;

    const parsed = contactSchema.safeParse(body.value);
    if (!parsed.success) return validationError(parsed.error);

    const { name, email, message, website } = parsed.data;
    const id = crypto.randomUUID();

    // Honeypot: accept silently, persist nothing.
    if (website !== "") return jsonResponse({ ok: true, id }, 201);

    const record = { id, receivedAt: new Date().toISOString(), name, email, message };

    try {
      await appendMessage(record);
    } catch {
      return errorResponse(500, "STORAGE_ERROR", "Could not save your message. Please try again.");
    }

    void forwardContactEmail(record); // best effort; never blocks or fails the request
    return jsonResponse({ ok: true, id }, 201);
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}
