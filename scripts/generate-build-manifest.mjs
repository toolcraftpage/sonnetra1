import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const buildDirectory = resolve(".next");
const buildIdPath = resolve(buildDirectory, "BUILD_ID");
const manifestPath = resolve(buildDirectory, "sonnetra-integration-build-target.json");

const supabaseUrlValue = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!supabaseUrlValue || !anonKey) {
  throw new Error(
    "Cannot generate the integration build target manifest: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.",
  );
}

let supabaseUrl;
try {
  const parsedUrl = new URL(supabaseUrlValue);
  if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password) {
    throw new Error("Invalid Supabase URL.");
  }
  supabaseUrl = parsedUrl.origin;
} catch {
  throw new Error("Cannot generate the integration build target manifest: NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL.");
}

let buildId;
try {
  buildId = readFileSync(buildIdPath, "utf8").trim();
} catch {
  throw new Error("Cannot generate the integration build target manifest: .next/BUILD_ID is missing or unreadable.");
}
if (!buildId) {
  throw new Error("Cannot generate the integration build target manifest: .next/BUILD_ID is empty.");
}

const configFingerprint = createHash("sha256")
  .update(JSON.stringify({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  }))
  .digest("hex");

const manifest = {
  version: 1,
  buildId,
  supabaseUrl,
  configFingerprint,
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
