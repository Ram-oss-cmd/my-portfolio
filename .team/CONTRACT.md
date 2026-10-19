# API CONTRACT — single source of truth

Owner: **backend**. Changes require a CHANGE_REQUEST + ACK from frontend and qa.

STATUS: **READY** — v1, 2026-10-19. Frontend may build against this; QA may write contract tests against this.

Base URL in local dev: `http://localhost:3000`. All endpoints are same-origin JSON APIs. No CORS
headers are sent; do not call them from another origin.

## Endpoints

| Method | Path | Purpose | Rate limit |
|---|---|---|---|
| GET | `/api/health` | Liveness probe | none |
| POST | `/api/contact` | Store a visitor message | 5 requests / 60 s / IP |
| POST | `/api/loan-estimate` | Sample loan calculation (illustration only) | 30 requests / 60 s / IP |

Unsupported methods on these paths get Next.js's automatic `405 Method Not Allowed` with an empty
body. Next.js 16.4.2 does **not** add an `Allow` header to 405 responses (verified); clients must
not rely on `Allow` or on a JSON body for 405. The automatic `OPTIONS` response does include
`Allow`.

## Conventions (apply to every endpoint)

### Request

- `POST` bodies must be JSON: `Content-Type: application/json` (a `; charset=utf-8` suffix is
  accepted). Anything else → `415 UNSUPPORTED_MEDIA_TYPE`.
- Maximum body size: **16 384 bytes (16 KiB)**. Larger → `413 PAYLOAD_TOO_LARGE`.
- Bodies are strict: unknown top-level keys are rejected with `VALIDATION_ERROR`.
- The server never echoes request bodies or internal paths/stack traces in responses.

### Error envelope (stable)

Every application error uses exactly this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid.",
    "fields": {
      "email": "Enter a valid email address."
    }
  }
}
```

- `error.code` — stable machine-readable string, one of the codes below.
- `error.message` — short human-readable sentence, safe to display.
- `error.fields` — present only for `VALIDATION_ERROR`; map of `fieldName → message`. Field names
  use dot paths for nested values. The first issue per field is reported.
- `error.retryAfterSeconds` — present only for `RATE_LIMITED`.
- All error responses include `Cache-Control: no-store`.

| Code | HTTP | When |
|---|---|---|
| `INVALID_JSON` | 400 | Body is empty or is not valid JSON |
| `VALIDATION_ERROR` | 400 | JSON is valid but fails the endpoint schema |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | `Content-Type` is not `application/json` |
| `PAYLOAD_TOO_LARGE` | 413 | Body exceeds 16 KiB |
| `RATE_LIMITED` | 429 | Per-IP limit exceeded; `Retry-After` header is also set |
| `STORAGE_ERROR` | 500 | Contact message could not be appended to disk |
| `INTERNAL_ERROR` | 500 | Unexpected server failure (no details leaked) |

`Retry-After` on 429 is an integer number of seconds (same value as
`error.retryAfterSeconds`), minimum `1`.

### Rate limiting

- In-memory, per server process, keyed by client IP + endpoint. Counters reset on restart and are
  not shared between server instances. This is intentional for a portfolio site.
- Client IP = first entry of `x-forwarded-for`, else `x-real-ip`, else the literal string
  `unknown`. (Spoofable when not behind a trusted proxy; acceptable for this site.)
- A request counts when it reaches the endpoint, even if it is later rejected by validation.
- Sliding window: fixed 60-second window per IP; when exceeded, the limit holds until the window
  resets. `retryAfterSeconds` is the number of seconds remaining in the current window.

### Success responses

- `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store`.
- JSON is UTF-8. Monetary numbers are JSON numbers rounded to 2 decimals (see loan section).

---

## GET /api/health

Liveness probe. Evaluated per request (never cached). No auth, no rate limit, no body.

### Response `200`

```json
{
  "status": "ok",
  "service": "shreeram-portfolio",
  "version": "0.1.0",
  "timestamp": "2026-10-19T07:30:00.000Z"
}
```

| Field | Type | Meaning |
|---|---|---|
| `status` | `"ok"` | Always `ok` when the handler is reachable |
| `service` | string | Constant `"shreeram-portfolio"` |
| `version` | string | Value of `package.json` version |
| `timestamp` | string | ISO-8601 UTC time of the request |

### Errors

No application errors. Non-GET → framework `405`.

---

## POST /api/contact

Stores one visitor message as an append-only JSONL line in `data/messages.jsonl`. No external
service is called by default.

### Request body

```json
{
  "name": "Ram Bahadur",
  "email": "ram@example.com",
  "message": "Hello, I would like to talk about a hydropower management system.",
  "website": ""
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | yes | trimmed, 1–100 characters |
| `email` | string | yes | valid email, max 254 characters; stored trimmed |
| `message` | string | yes | trimmed, 10–5 000 characters; newlines preserved |
| `website` | string | no | **honeypot**; default `""`, max 200 characters |

Unknown top-level keys → `400 VALIDATION_ERROR` with `fields._root` set.

### Success `201`

```json
{
  "ok": true,
  "id": "3f2b6c1e-9a1d-4f6c-b0e2-7c9a4d5e8f10"
}
```

- `id` is a UUID v4 generated server-side.
- The success body is identical whether or not the honeypot was filled, so bots cannot detect the
  trap.

### Honeypot behavior

If `website` is a non-empty string (after trim), the request is silently accepted with the same
`201` body but **nothing is persisted and no email is sent**. Frontend should keep this field
hidden from real users (e.g. visually hidden, `tabindex="-1"`, `autocomplete="off"`).

### Stored record (`data/messages.jsonl`, one JSON object per line)

```json
{"id":"3f2b6c1e-9a1d-4f6c-b0e2-7c9a4d5e8f10","receivedAt":"2026-10-19T07:31:00.000Z","name":"Ram Bahadur","email":"ram@example.com","message":"Hello, I would like to talk about a hydropower management system."}
```

- Only visitor-submitted fields plus `id` and `receivedAt` are stored. The client IP and
  user-agent are **not** stored.
- The directory is created at runtime if missing (`mkdir -p data`).
- Writes are appends; existing lines are never modified or deleted.

### Optional email forwarding (off by default)

No email is sent unless **all three** env vars are set:

| Env var | Meaning |
|---|---|
| `RESEND_API_KEY` | Resend API key (server-only; never exposed to the client) |
| `CONTACT_EMAIL_TO` | Destination inbox |
| `CONTACT_EMAIL_FROM` | Verified sender, e.g. `portfolio@yourdomain.com` |

When configured, the server best-effort POSTs the message to Resend after a successful file
append. Forwarding failures do not change the API response (still `201`); they are logged as a
short error code only, never the message body. Leave all vars unset to disable email entirely.
See `.env.example`.

### Errors

| Status | Code | Notes |
|---|---|---|
| 400 | `INVALID_JSON` | empty or malformed body |
| 400 | `VALIDATION_ERROR` | example below |
| 413 | `PAYLOAD_TOO_LARGE` | body > 16 KiB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | not JSON |
| 429 | `RATE_LIMITED` | 5 / 60 s / IP |
| 500 | `STORAGE_ERROR` | file append failed; safe message, no path leaked |
| 500 | `INTERNAL_ERROR` | unexpected failure |

Validation error example (`email` missing, `message` too short):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid.",
    "fields": {
      "email": "Invalid email address",
      "message": "Message must be at least 10 characters"
    }
  }
}
```

Rate-limit error example:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Try again later.",
    "retryAfterSeconds": 42
  }
}
```

with response header `Retry-After: 42`.

---

## POST /api/loan-estimate

Pure sample calculation. **Sample data only — never real client data.** The UI must label results
“Sample data, not client data”. This is an illustration, not financial advice.

### Request body

```json
{
  "principal": 250000,
  "annualRatePercent": 12.5,
  "months": 24,
  "method": "reducing"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `principal` | number | yes | finite, `> 0`, `<= 1_000_000_000` |
| `annualRatePercent` | number | yes | finite, `0 <= x <= 100`; `0` is valid |
| `months` | integer | yes | `1 <= x <= 360` |
| `method` | string | yes | `"simple"` or `"reducing"` |

Numbers must be JSON numbers, not strings. Unknown keys are rejected.

### Success `200`

```json
{
  "method": "reducing",
  "principal": 250000,
  "annualRatePercent": 12.5,
  "months": 24,
  "monthlyPayment": 11826.83,
  "totalInterest": 33843.87,
  "totalPayable": 283843.87,
  "schedule": [
    {
      "month": 1,
      "openingBalance": 250000,
      "payment": 11826.83,
      "interest": 2604.17,
      "principal": 9222.66,
      "closingBalance": 240777.34
    }
  ]
}
```

The real schedule always has exactly `months` rows (the example is abbreviated).

| Field | Type | Meaning |
|---|---|---|
| `method` | `"simple" \| "reducing"` | Echo of input |
| `principal` | number | Echo of input |
| `annualRatePercent` | number | Echo of input |
| `months` | integer | Echo of input |
| `monthlyPayment` | number | **First** schedule payment (month 1) |
| `totalInterest` | number | Sum of `schedule[].interest`, rounded to 2 dp |
| `totalPayable` | number | Sum of `schedule[].payment`, rounded to 2 dp; equals `principal + totalInterest` |
| `schedule` | array | One row per month, in ascending `month` order |

Schedule row:

| Field | Type | Meaning |
|---|---|---|
| `month` | integer | 1-based period number |
| `openingBalance` | number | Balance before this payment |
| `payment` | number | Principal + interest paid this period |
| `interest` | number | Interest portion this period |
| `principal` | number | Principal portion this period |
| `closingBalance` | number | Opening − principal; exactly `0` in the final row |

### Rounding and math rules (exact)

All monetary values are rounded to **2 decimal places, half away from zero**, at the point
stated. Balances are carried forward from the rounded `closingBalance`, so the schedule is the
source of truth. For every response:

- `schedule[last].closingBalance === 0`
- sum of `schedule[].principal === principal`
- `totalInterest = round2(sum(schedule[].interest))`
- `totalPayable = round2(sum(schedule[].payment)) = principal + totalInterest`
- `monthlyPayment = schedule[0].payment`

Let `P = principal`, `A = annualRatePercent`, `n = months`, `r = A / 1200` (monthly decimal rate).

**Reducing balance (`method: "reducing"`)**

1. If `A = 0`, fixed payment = `P / n`. Otherwise
   `EMI = P * r * (1 + r)^n / ((1 + r)^n − 1)`, then `fixed = round2(EMI)`.
2. For months `1 .. n−1`: `interest = round2(opening * r)`;
   `payment = fixed`; `principal = round2(payment − interest)`;
   `closing = round2(opening − principal)`. The next opening is this closing.
3. Month `n`: the loan is paid off exactly — `principal = opening`,
   `interest = round2(opening * r)`, `payment = round2(principal + interest)`. This final payment
   may differ from `fixed` by a few cents.
4. If a non-final `principal` would exceed `opening` (only possible on tiny remainders), it is
   capped at `opening` and that payment is adjusted to `round2(opening + interest)`.

**Simple interest (`method: "simple"`)**

1. `totalInterest = round2(P * (A / 100) * (n / 12))`.
2. Interest allocation: `baseInterest = round2(totalInterest / n)` for months `1 .. n−1`; the final
   month gets `round2(totalInterest − baseInterest * (n − 1))` so the parts sum exactly to
   `totalInterest`.
3. Principal allocation: `basePrincipal = round2(P / n)` for months `1 .. n−1`; the final month
   gets `round2(P − basePrincipal * (n − 1))` so the parts sum exactly to `P`.
4. Each row: `payment = round2(principal + interest)`;
   `closing = round2(opening − principal)`.
5. `A = 0` is valid and yields zero interest and `totalPayable = P`.

### Worked example A — SAMPLE DATA (simple)

Input: `principal = 250000`, `annualRatePercent = 12.5`, `months = 24`, `method = "simple"`.

- `totalInterest = round2(250000 * 0.125 * 2) = 62500.00`
- `totalPayable = 250000 + 62500 = 312500.00`
- `baseInterest = round2(62500 / 24) = 2604.17` (months 1–23); final interest = `2604.09`
- `basePrincipal = round2(250000 / 24) = 10416.67` (months 1–23); final principal = `10416.59`

| month | openingBalance | payment | interest | principal | closingBalance |
|---|---|---|---|---|---|
| 1 | 250000.00 | 13020.84 | 2604.17 | 10416.67 | 239583.33 |
| 2 | 239583.33 | 13020.84 | 2604.17 | 10416.67 | 229166.66 |
| 3 | 229166.66 | 13020.84 | 2604.17 | 10416.67 | 218749.99 |
| … | … | … | … | … | … |
| 23 | 20833.26 | 13020.84 | 2604.17 | 10416.67 | 10416.59 |
| 24 | 10416.59 | 13020.68 | 2604.09 | 10416.59 | 0.00 |

`monthlyPayment = 13020.84`, `totalInterest = 62500.00`, `totalPayable = 312500.00`.

### Worked example B — SAMPLE DATA (reducing)

Same input with `method = "reducing"`.

- `r = 12.5 / 1200 = 0.010416666666666666`
- `EMI = 250000 * r * (1 + r)^24 / ((1 + r)^24 − 1) ≈ 11826.834…` → `fixed = 11826.83`
- `monthlyPayment = 11826.83`

| month | openingBalance | payment | interest | principal | closingBalance |
|---|---|---|---|---|---|
| 1 | 250000.00 | 11826.83 | 2604.17 | 9222.66 | 240777.34 |
| 2 | 240777.34 | 11826.83 | 2508.10 | 9318.73 | 231458.61 |
| 3 | 231458.61 | 11826.83 | 2411.03 | 9415.80 | 222042.81 |
| … | … | … | … | … | … |
| 23 | 23289.09 | 11826.83 | 242.59 | 11584.24 | 11704.85 |
| 24 | 11704.85 | 11826.78 | 121.93 | 11704.85 | 0.00 |

`totalInterest = 33843.87`, `totalPayable = 283843.87`.

### Worked example C — SAMPLE DATA (zero interest)

Input: `principal = 250000`, `annualRatePercent = 0`, `months = 24`, `method = "reducing"`.
`monthlyPayment = 10416.67`, every `interest = 0`, `totalInterest = 0`,
`totalPayable = 250000.00`, final payment `10416.59`, final `closingBalance = 0`.

### Errors

| Status | Code | Notes |
|---|---|---|
| 400 | `INVALID_JSON` | empty or malformed body |
| 400 | `VALIDATION_ERROR` | example below |
| 413 | `PAYLOAD_TOO_LARGE` | body > 16 KiB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | not JSON |
| 429 | `RATE_LIMITED` | 30 / 60 s / IP |
| 500 | `INTERNAL_ERROR` | unexpected failure |

Validation error example (`months = 0`, `method = "flat"`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid.",
    "fields": {
      "months": "Months must be at least 1",
      "method": "Invalid option: expected one of \"simple\"|\"reducing\""
    }
  }
}
```

---

## Env vars (`.env.example`)

```
# Contact email forwarding is OFF unless all three are set.
# Email is best-effort after the message is appended to data/messages.jsonl.
RESEND_API_KEY=
CONTACT_EMAIL_TO=
CONTACT_EMAIL_FROM=
```

No other env vars are required. Runtime data lives in `data/messages.jsonl` (git-ignored).
