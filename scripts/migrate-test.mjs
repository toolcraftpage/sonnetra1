import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const projectRef = "pcmgxutpyflmbsmzbhcw";
const expectedDirectHost = `db.${projectRef}.supabase.co`;
const projectPoolerUsername = `postgres.${projectRef}`;

try {
  process.loadEnvFile(resolve(".env.local"));
} catch {
  throw new Error("BLOCKED: Unable to load the root .env.local file.");
}

const dbUrlValue = process.env.SUPABASE_DB_URL;
let dbUrl;
try {
  dbUrl = new URL(dbUrlValue ?? "");
} catch {
  throw new Error("BLOCKED: DB_URL does not target the disposable project.");
}

const directTarget = dbUrl.hostname === expectedDirectHost;
const poolerTarget =
  dbUrl.hostname.endsWith(".pooler.supabase.com")
  && decodeURIComponent(dbUrl.username) === projectPoolerUsername;
if (
  !["postgres:", "postgresql:"].includes(dbUrl.protocol)
  || dbUrl.password.length === 0
  || (!directTarget && !poolerTarget)
) {
  throw new Error("BLOCKED: DB_URL does not target the disposable project.");
}

const localMigrationFiles = readdirSync(resolve("supabase/migrations"))
  .filter((name) => name.endsWith(".sql"))
  .sort();
if (localMigrationFiles.length !== 6) {
  throw new Error(`BLOCKED: Expected 6 local migrations; found ${localMigrationFiles.length}.`);
}

const npmCliPath = process.env.npm_execpath;
if (!npmCliPath || !existsSync(npmCliPath)) {
  throw new Error("Cannot locate npm's CLI runner. Run this script with npm run migrate:test.");
}
const npxCliPath = resolve(dirname(npmCliPath), "npx-cli.js");
if (!existsSync(npxCliPath)) {
  throw new Error("Cannot locate npm's npx runner.");
}

function redactOutput(value) {
  let output = value;
  const replacements = new Set([
    dbUrlValue,
    encodeURIComponent(dbUrlValue),
    dbUrl.password,
    decodeURIComponent(dbUrl.password),
  ].filter(Boolean));
  for (const secret of replacements) {
    output = output.replaceAll(secret, "[REDACTED]");
  }
  return output.replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/giu, "[DATABASE URI REDACTED]");
}

async function runSupabase(args, operation) {
  const child = spawn(process.execPath, [npxCliPath, "--yes", "supabase", ...args], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  const stdoutChunks = [];
  const stderrChunks = [];
  child.stdout.on("data", (chunk) => stdoutChunks.push(chunk));
  child.stderr.on("data", (chunk) => stderrChunks.push(chunk));

  const exitCode = await new Promise((resolveExit, reject) => {
    child.once("error", (error) => reject(new Error(`${operation} could not start (${error.code ?? "spawn error"}).`)));
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${operation} terminated by signal ${signal}.`));
      } else {
        resolveExit(code ?? 1);
      }
    });
  });

  const stdout = redactOutput(Buffer.concat(stdoutChunks).toString("utf8"));
  const stderr = redactOutput(Buffer.concat(stderrChunks).toString("utf8"));
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  if (exitCode !== 0) {
    throw new Error(`${operation} failed with exit code ${exitCode}.`);
  }
}

const dbUrlArgs = ["--db-url", dbUrlValue];
await runSupabase(["migration", "list", ...dbUrlArgs], "Remote migration history");
await runSupabase(["db", "push", ...dbUrlArgs, "--dry-run"], "Migration dry run");

console.log(`Local migration files (${localMigrationFiles.length}):`);
for (const migration of localMigrationFiles) {
  console.log(`  ${migration}`);
}

async function readApplyConfirmation() {
  if (!process.stdin.isTTY) {
    return process.argv.includes("--confirm") && process.argv.includes("APPLY");
  }

  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await terminal.question("Type APPLY to apply these migrations: ")) === "APPLY";
  } finally {
    terminal.close();
  }
}

if (!(await readApplyConfirmation())) {
  console.log("Dry run complete; no migrations were applied. Review the plan, then run `npm run migrate:test -- --confirm APPLY` to approve and apply.");
  process.exit(0);
}

await runSupabase(["db", "push", ...dbUrlArgs], "Migration push");
await runSupabase(["migration", "list", ...dbUrlArgs], "Post-push migration history");
