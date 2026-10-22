import { spawn } from "node:child_process";
import { resolve } from "node:path";

const testSupabaseUrl = "https://pcmgxutpyflmbsmzbhcw.supabase.co";

try {
  process.loadEnvFile(resolve(".env.local"));
} catch {
  throw new Error("The test build requires a readable root .env.local file.");
}

process.env.NEXT_PUBLIC_SUPABASE_URL = testSupabaseUrl;
process.env.SUPABASE_URL = testSupabaseUrl;

const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serverAnonKey = process.env.SUPABASE_ANON_KEY?.trim();
if (!publicAnonKey || !serverAnonKey) {
  throw new Error("The test build requires both Supabase anon-key aliases in .env.local or the process environment.");
}
if (publicAnonKey !== serverAnonKey) {
  throw new Error("The test build requires matching SUPABASE_ANON_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY aliases.");
}

process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = publicAnonKey;
process.env.SUPABASE_ANON_KEY = publicAnonKey;

async function runNodeScript(scriptPath, args = []) {
  const child = spawn(process.execPath, [resolve(scriptPath), ...args], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  });

  const exitCode = await new Promise((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${scriptPath} terminated by signal ${signal}.`));
      } else {
        resolveExit(code ?? 1);
      }
    });
  });

  if (exitCode !== 0) {
    process.exitCode = exitCode;
    return false;
  }
  return true;
}

if (await runNodeScript("node_modules/next/dist/bin/next", ["build"])) {
  await runNodeScript("scripts/generate-build-manifest.mjs");
}
