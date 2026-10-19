import { connection } from "next/server";
import packageJson from "../../../../package.json";
import { jsonResponse } from "@/lib/server/http";

export async function GET() {
  await connection(); // request-time: timestamp must not be prerendered

  return jsonResponse({
    status: "ok",
    service: "shreeram-portfolio",
    version: packageJson.version,
    timestamp: new Date().toISOString(),
  });
}
