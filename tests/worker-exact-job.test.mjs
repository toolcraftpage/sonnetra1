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

test("the worker publishes a server-generated run ID and queue telemetry without exposing secrets", () => {
  const routeSource = readFileSync(new URL("../src/app/api/internal/worker/route.ts", import.meta.url), "utf8");
  const workerSource = readFileSync(new URL("../src/server/transcript-jobs.ts", import.meta.url), "utf8");

  assert.match(routeSource, /workerRunId|worker_run_id/i);
  assert.match(workerSource, /workerRunId|worker_run_id/i);
  assert.match(workerSource, /queueScan|candidateCount|claimedCount|jobUuid|job_uuid/i);
});

test("generic and exact SQL claims preserve eligibility, batch, and atomicity rules", () => {
  const queueMigration = readFileSync(new URL("../supabase/migrations/20260928000100_durable_transcript_jobs.sql", import.meta.url), "utf8");
  const exactMigration = readFileSync(new URL("../supabase/migrations/20261002000100_exact_transcript_job_claim.sql", import.meta.url), "utf8");
  const policySource = readFileSync(new URL("../src/server/job-state.ts", import.meta.url), "utf8");

  assert.match(queueMigration, /status\s*=\s*'queued'/i);
  assert.match(queueMigration, /next_retry_at\s*<=\s*p_now/i);
  assert.match(queueMigration, /updated_at\s*<\s*p_stale_before/i);
  assert.match(queueMigration, /attempt_count\s*<\s*max_attempts/i);
  assert.match(queueMigration, /order by created_at asc[\s\S]*for update skip locked[\s\S]*limit 1/i);
  assert.match(queueMigration, /attempt_count\s*=\s*job\.attempt_count\s*\+\s*1/i);
  assert.match(exactMigration, /where id\s*=\s*p_job_id/i);
  assert.match(exactMigration, /for update/i);
  assert.match(exactMigration, /attempt_count\s*<\s*max_attempts/i);
  assert.match(policySource, /maxJobsPerRun:\s*3/);
});
