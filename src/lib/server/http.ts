const MAX_BODY_BYTES = 16_384;

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: JSON_HEADERS,
  });
}

type ErrorExtras = {
  fields?: Record<string, string>;
  retryAfterSeconds?: number;
};

export function errorResponse(
  status: number,
  code: string,
  message: string,
  extras: ErrorExtras = {},
): Response {
  const error: Record<string, unknown> = { code, message };
  if (extras.fields) error.fields = extras.fields;
  if (extras.retryAfterSeconds !== undefined) {
    error.retryAfterSeconds = extras.retryAfterSeconds;
  }

  const headers: Record<string, string> = { ...JSON_HEADERS };
  if (extras.retryAfterSeconds !== undefined) {
    headers["retry-after"] = String(extras.retryAfterSeconds);
  }

  return Response.json({ error }, { status, headers });
}

export function validationError(error: { issues: { path: PropertyKey[]; message: string }[] }): Response {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    if (!(key in fields)) fields[key] = issue.message;
  }
  return errorResponse(400, "VALIDATION_ERROR", "Request body is invalid.", { fields });
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

type JsonBodyResult = { ok: true; value: unknown } | { ok: false; response: Response };

export async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!/^application\/json\b/.test(contentType)) {
    return {
      ok: false,
      response: errorResponse(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json."),
    };
  }

  const declared = request.headers.get("content-length");
  if (declared !== null && Number(declared) > MAX_BODY_BYTES) {
    return { ok: false, response: tooLarge() };
  }

  const text = await readTextWithLimit(request, MAX_BODY_BYTES);
  if (text === null) return { ok: false, response: tooLarge() };

  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return {
      ok: false,
      response: errorResponse(400, "INVALID_JSON", "Request body must be valid JSON."),
    };
  }
}

function tooLarge(): Response {
  return errorResponse(413, "PAYLOAD_TOO_LARGE", "Request body must be at most 16 KiB.");
}

/** Reads the body as UTF-8, cancelling the stream once it exceeds `limit` bytes. */
async function readTextWithLimit(request: Request, limit: number): Promise<string | null> {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }

  return text + decoder.decode();
}
