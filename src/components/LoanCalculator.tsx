"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { loanSample } from "@/data/content";
import { ApiError, api, type LoanInput, type LoanMethod, type LoanResult } from "@/lib/api";

const npr = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 2,
});

type Status = "idle" | "loading" | "ready" | "error";

export function LoanCalculator() {
  const [principal, setPrincipal] = useState(String(loanSample.principal));
  const [rate, setRate] = useState(String(loanSample.annualRatePercent));
  const [term, setTerm] = useState(String(loanSample.months));
  const [method, setMethod] = useState<LoanMethod>(loanSample.method);
  const [result, setResult] = useState<LoanResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const calculate = useCallback(async (input: LoanInput) => {
    const id = requestId.current + 1;
    requestId.current = id;
    setStatus("loading");
    setError("");
    setFieldErrors({});

    try {
      const next = await api.loanEstimate(input);
      if (!mounted.current || id !== requestId.current) return;
      setResult(next);
      setStatus("ready");
    } catch (caught) {
      if (!mounted.current || id !== requestId.current) return;
      if (caught instanceof ApiError) {
        setError(caught.message);
        if (caught.fieldErrors) setFieldErrors(caught.fieldErrors);
      } else {
        setError("Something went wrong while calculating. Try again.");
      }
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => void calculate(loanSample));
    return () => cancelAnimationFrame(frame);
  }, [calculate]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const principalValue = Number(principal);
    const rateValue = Number(rate);
    const termValue = Number(term);
    const errors: Record<string, string> = {};

    if (!Number.isFinite(principalValue) || principalValue <= 0) {
      errors.principal = "Enter an amount above 0.";
    } else if (principalValue > 1_000_000_000) {
      errors.principal = "Keep the sample under NPR 1,000,000,000.";
    }

    if (!Number.isFinite(rateValue) || rateValue < 0 || rateValue > 100) {
      errors.annualRatePercent = "Enter a rate between 0 and 100.";
    }

    if (!Number.isInteger(termValue) || termValue < 1 || termValue > 360) {
      errors.months = "Enter a whole number of months from 1 to 360.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus("idle");
      return;
    }

    void calculate({
      principal: principalValue,
      annualRatePercent: rateValue,
      months: termValue,
      method,
    });
  };

  return (
    <div className="loan">
      <div className="loan__head">
        <p className="loan__hint">Sample data, not client data.</p>
      </div>

      <form className="loan__form" onSubmit={onSubmit} aria-busy={status === "loading"}>
        <div className="field">
          <label htmlFor="loan-principal">Principal</label>
          <input
            id="loan-principal"
            name="principal"
            type="number"
            inputMode="decimal"
            min="1"
            step="any"
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
            aria-invalid={Boolean(fieldErrors.principal)}
            aria-describedby={fieldErrors.principal ? "loan-principal-error" : undefined}
          />
          {fieldErrors.principal ? (
            <p className="field__error" id="loan-principal-error">
              {fieldErrors.principal}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="loan-rate">Annual interest rate</label>
          <input
            id="loan-rate"
            name="annualRatePercent"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="any"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            aria-invalid={Boolean(fieldErrors.annualRatePercent)}
            aria-describedby={fieldErrors.annualRatePercent ? "loan-rate-error" : undefined}
          />
          {fieldErrors.annualRatePercent ? (
            <p className="field__error" id="loan-rate-error">
              {fieldErrors.annualRatePercent}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="loan-term">Months</label>
          <input
            id="loan-term"
            name="months"
            type="number"
            inputMode="numeric"
            min="1"
            max="360"
            step="1"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            aria-invalid={Boolean(fieldErrors.months)}
            aria-describedby={fieldErrors.months ? "loan-term-error" : undefined}
          />
          {fieldErrors.months ? (
            <p className="field__error" id="loan-term-error">
              {fieldErrors.months}
            </p>
          ) : null}
        </div>

        <fieldset className="field loan__method">
          <legend>Method</legend>
          <div className="loan__method-options">
            <label>
              <input
                type="radio"
                name="method"
                value="reducing"
                checked={method === "reducing"}
                onChange={() => setMethod("reducing")}
              />
              Reducing balance
            </label>
            <label>
              <input
                type="radio"
                name="method"
                value="simple"
                checked={method === "simple"}
                onChange={() => setMethod("simple")}
              />
              Simple interest
            </label>
          </div>
          {fieldErrors.method ? (
            <p className="field__error">{fieldErrors.method}</p>
          ) : null}
        </fieldset>

        <button
          type="submit"
          className="button button--primary loan__submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Calculating…" : "Calculate"}
        </button>
      </form>

      <div className="loan__status" role="status" aria-live="polite">
        {status === "loading" ? "Calculating…" : null}
      </div>

      {status === "error" ? (
        <div className="alert alert--error" role="alert">
          <p>{error}</p>
          <button type="button" className="button button--ghost button--small" onClick={() => void calculate(loanSample)}>
            Retry sample
          </button>
        </div>
      ) : null}

      <div className="loan__result" aria-live="polite">
        {result ? (
          <>
            <div className="loan__result-row loan__result-row--main">
              <span>Monthly payment</span>
              <strong>{npr.format(result.monthlyPayment)}</strong>
            </div>
            <div className="loan__result-row">
              <span>Total interest</span>
              <strong>{npr.format(result.totalInterest)}</strong>
            </div>
            <div className="loan__result-row">
              <span>Total payable</span>
              <strong>{npr.format(result.totalPayable)}</strong>
            </div>
            <p className="loan__foot">
              {npr.format(result.principal)} over {result.months} months at{" "}
              {result.annualRatePercent}% annual interest. A working sample of
              Temke&apos;s interest engine; no client data is shown.
            </p>
          </>
        ) : (
          <p className="loan__foot">Enter sample numbers and calculate.</p>
        )}
      </div>
    </div>
  );
}
