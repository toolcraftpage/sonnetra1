import { createHash, randomBytes } from "node:crypto";

export function createJobAccessToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashJobAccessToken(token) };
}

export function hashJobAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function resolveJobAccessToken(input?: URLSearchParams | Record<string, string | string[] | undefined> | null): string | null {
  if (!input) return null;

  const values = input instanceof URLSearchParams
    ? [input.get("token"), input.get("jobToken"), input.get("access_token"), input.get("x-job-token")]
    : [input.token, input.jobToken, input.access_token, input["x-job-token"]];

  for (const candidate of values) {
    const tokenValue = Array.isArray(candidate) ? candidate.at(-1) : candidate;
    if (typeof tokenValue !== "string") continue;
    const trimmed = tokenValue.trim();
    if (trimmed) return trimmed;
  }

  return null;
}