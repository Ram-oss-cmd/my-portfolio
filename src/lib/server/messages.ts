import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type StoredMessage = {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  message: string;
};

const dataDir = path.join(process.cwd(), "data");
const messagesFile = path.join(dataDir, "messages.jsonl");

export async function appendMessage(record: StoredMessage): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await appendFile(messagesFile, `${JSON.stringify(record)}\n`, "utf8");
}

/** Best-effort email forwarding; disabled unless all three env vars are set. */
export async function forwardContactEmail(record: StoredMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  const from = process.env.CONTACT_EMAIL_FROM;
  if (!apiKey || !to || !from) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Portfolio contact from ${record.name}`,
        text: `From: ${record.name} <${record.email}>\n\n${record.message}`,
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) console.error(`contact email forward failed: HTTP ${response.status}`);
  } catch {
    console.error("contact email forward failed: network error");
  }
}
