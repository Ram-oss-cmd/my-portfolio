import { z } from "zod";
import { estimateLoan } from "@/lib/loan";
import { clientIp, errorResponse, jsonResponse, readJsonBody, validationError } from "@/lib/server/http";
import { checkRateLimit } from "@/lib/server/rate-limit";

const loanSchema = z.strictObject({
  principal: z
    .number()
    .positive("Principal must be greater than 0")
    .max(1_000_000_000, "Principal must be at most 1000000000"),
  annualRatePercent: z
    .number()
    .min(0, "Annual rate must be at least 0")
    .max(100, "Annual rate must be at most 100"),
  months: z
    .number()
    .int("Months must be a whole number")
    .min(1, "Months must be at least 1")
    .max(360, "Months must be at most 360"),
  method: z.enum(["simple", "reducing"]),
});

export async function POST(request: Request) {
  try {
    const limit = checkRateLimit("loan", clientIp(request), 30);
    if (!limit.allowed) {
      return errorResponse(429, "RATE_LIMITED", "Too many requests. Try again later.", {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    const body = await readJsonBody(request);
    if (!body.ok) return body.response;

    const parsed = loanSchema.safeParse(body.value);
    if (!parsed.success) return validationError(parsed.error);

    return jsonResponse(estimateLoan(parsed.data));
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}
