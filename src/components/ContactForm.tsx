"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError, api } from "@/lib/api";

type Status = "idle" | "submitting" | "success" | "error";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = "Enter your name (2 characters or more).";
    if (!emailPattern.test(email.trim())) errors.email = "Enter a valid email address.";
    if (message.trim().length < 10) errors.message = "Tell me a little more (10 characters or more).";
    if (message.trim().length > 5000) errors.message = "Keep the message under 5,000 characters.";

    setFieldErrors(errors);
    setError("");
    if (Object.keys(errors).length > 0) {
      setStatus("idle");
      return;
    }

    setStatus("submitting");
    try {
      await api.contact({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        website,
      });
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setWebsite("");
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        if (caught.fieldErrors) setFieldErrors(caught.fieldErrors);
      } else {
        setError("Could not send the message. Try again.");
      }
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="contact-form contact-form--done" role="status">
        <h3 ref={successRef} tabIndex={-1}>
          Message received.
        </h3>
        <p>Thanks — I&apos;ll read it soon.</p>
        <button
          type="button"
          className="button button--ghost"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} aria-busy={status === "submitting"}>
      {status === "error" ? (
        <div className="alert alert--error" role="alert">
          <p>{error}</p>
          <button type="submit" className="button button--ghost button--small">
            Retry send
          </button>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="contact-name">Name</label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
        />
        {fieldErrors.name ? (
          <p className="field__error" id="contact-name-error">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p className="field__error" id="contact-email-error">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="field">
        <div className="field__label-row">
          <label htmlFor="contact-message">Message</label>
          <span className="field__count">{message.length}/5000</span>
        </div>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          maxLength={5000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
        />
        {fieldErrors.message ? (
          <p className="field__error" id="contact-message-error">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <button
        type="submit"
        className="button button--primary contact-form__submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
      <p className="contact-form__note">
        Messages go to this site&apos;s own API. No tracking, no third-party inbox.
      </p>
    </form>
  );
}
