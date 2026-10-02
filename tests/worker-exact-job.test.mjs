import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the worker and DB layer include an exact-job safety path alongside the queue worker", () => {
  const routeSource = readFileSync(new URL("../src/app/api/internal/worker/route.ts", import.meta.url), "utf8");
  const workerSource = readFileSync(new URL("../src/server/transcript-jobs.ts", import.meta.url), "utf8");
  const migrationSource = readFileSync(new URL("../supabase/migrations/20261002000100_exact_transcript_job_claim.sql", import.meta.url), "utf8");

  assert.match(routeSource, /jobId/i);
  assert.match(workerSource, /processJobById/i);
  assert.match(workerSource, /claimById/i);
  assert.match(migrationSource, /claim_transcript_job_by_id/i);
});
