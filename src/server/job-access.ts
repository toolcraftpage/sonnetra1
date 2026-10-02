import "server-only";

import { createHash, randomBytes } from "node:crypto";

export function createJobAccessToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashJobAccessToken(token) };
}

export function hashJobAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}