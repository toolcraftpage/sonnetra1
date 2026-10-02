import { existsSync } from "node:fs";
import { checkEnvironmentPresence } from "../src/lib/env.ts";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const requiredEnvironment = checkEnvironmentPresence();
const testUsers = [
  "SONNETRA_TEST_USER_A_EMAIL",
  "SONNETRA_TEST_USER_A_PASSWORD",
  "SONNETRA_TEST_USER_B_EMAIL",
  "SONNETRA_TEST_USER_B_PASSWORD",
].map((name) => ({
  name,
  status: process.env[name]?.trim() ? "PRESENT" : "MISSING",
}));

console.log("SONNETRA PHASE 17 SAFE PREFLIGHT");
console.log("\nMANUAL PREREQUISITES");
console.log("- Rotate the Supabase service-role credential in the official dashboard; update .env.local.");
console.log("- Rotate the Supadata credential in the official dashboard; update .env.local.");
console.log("- Confirm WORKER_SECRET is configured locally and in Vercel if used.");
console.log("- Create User A and User B through application signup or Supabase Auth user management.");
console.log("- Configure test account credentials only in ignored local environment variables.");
console.log("\nENVIRONMENT");
for (const [name, status] of Object.entries(requiredEnvironment)) {
  console.log(`${name}: ${status}`);
}
console.log("\nTEST ACCOUNT CONFIGURATION");
for (const { name, status } of testUsers) {
  console.log(`${name}: ${status}`);
}
console.log("\nCONTROLLED WORKER");
console.log("BLOCKED BY QUEUE-SAFETY DESIGN: the worker claims the oldest eligible shared-queue job and cannot target a verification-run job.");
console.log("Do not call POST /api/internal/worker for this verification run.");

if (
  Object.values(requiredEnvironment).includes("MISSING") ||
  testUsers.some(({ status }) => status === "MISSING")
) {
  console.log("\nLIVE VERIFICATION: STOPPED AT PREFLIGHT");
  process.exitCode = 1;
} else {
  console.log("\nLIVE VERIFICATION: BLOCKED BEFORE WORKER EXECUTION");
  console.log("Credential rotation requires manual confirmation; the shared worker queue must be made safely targetable before live pipeline verification.");
  process.exitCode = 2;
}