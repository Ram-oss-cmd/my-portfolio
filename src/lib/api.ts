/**
 * Typed client for the portfolio API. Mirrors .team/CONTRACT.md (READY, v1).
 * Requests and error envelopes are strict; failures surface to the UI.
 */

export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors?: Record<string, string>;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    status = 0,
    code = "unknown",
    fieldErrors?: Record<string, string>,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export type HealthResult = {
  status: "ok";
  service: string;
  version: string;
  timestamp: string;
};

export type ContactInput = {
  name: string;
  email: string;
  message: string;
  /** Honeypot. Always "" for real visitors. */
  website?: string;
};

export type ContactResult = {
  ok: true;
  id: string;
};

export type LoanMethod = "simple" | "reducing";

export type LoanInput = {
  principal: number;
  annualRatePercent: number;
  months: number;
  method: LoanMethod;
};

export type LoanScheduleRow = {
  month: number;
  openingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  closingBalance: number;
};

export type LoanResult = {
  method: LoanMethod;
  principal: number;
  annualRatePercent: number;
  months: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayable: number;
  schedule: LoanScheduleRow[];
};

type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
    retryAfterSeconds?: number;
  };
};

const TIMEOUT_MS = 10_000;

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  timeoutMs?: number;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(path, {
      method: options.method ?? "GET",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "The request timed out after 10 seconds. Try again.",
        0,
        "timeout",
      );
    }
    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
      0,
      "network",
    );
  } finally {
    clearTimeout(timer);
  }

  const payload = (await response.json().catch(() => null)) as
    | (T & ErrorBody)
    | null;

  if (!response.ok) {
    const detail = payload?.error;
    throw new ApiError(
      detail?.message ?? `Request failed (${response.status}).`,
      response.status,
      detail?.code ?? "http_error",
      detail?.fields,
      detail?.retryAfterSeconds,
    );
  }

  return payload as T;
}

export const api = {
  health(): Promise<HealthResult> {
    return request<HealthResult>("/api/health", { timeoutMs: 5000 });
  },

  contact(input: ContactInput): Promise<ContactResult> {
    return request<ContactResult>("/api/contact", {
      method: "POST",
      body: { ...input, website: input.website ?? "" },
    });
  },

  loanEstimate(input: LoanInput): Promise<LoanResult> {
    return request<LoanResult>("/api/loan-estimate", {
      method: "POST",
      body: input,
    });
  },
};
