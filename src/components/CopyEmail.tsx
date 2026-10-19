"use client";

import { useState } from "react";
import { contact } from "@/data/content";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  return (
    <button type="button" className="button button--light" onClick={copy}>
      {copied ? "Copied" : "Copy email"}
    </button>
  );
}
