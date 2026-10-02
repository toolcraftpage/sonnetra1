import { existsSync } from "node:fs";
import { validateEnvironment } from "../src/lib/env.ts";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const entries = validateEnvironment();

for (const { name, visibility, status } of entries) {
  console.log(`${status.padEnd(10)} ${visibility.padEnd(11)} ${name}`);
}

if (entries.some(({ status }) => status === "INVALID")) {
  process.exitCode = 1;
}