import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { assertTransition, canTransition, isRetryableErrorCode, JOB_RETRY_POLICY, retryDelayMs } from "../src/server/job-state.ts";

function supabaseJson(sql) {
  const cliPath = "C:\\Users\\BABI TECH ZONE\\AppData\\Roaming\\npm\\node_modules\\supabase\\dist\\supabase.js";
  const output = execFileSync(process.execPath, [cliPath, "db", "query", "--linked", "--output", "json", sql], { encoding: "utf8" });
  return JSON.parse(output);
}

test("job state machine allows only durable lifecycle transitions", () => {
  assert.equal(canTransition("queued", "processing"), true);
  assert.equal(canTransition("processing", "retrying"), true);
  assert.equal(canTransition("retrying", "processing"), true);
  assert.equal(canTransition("failed", "retrying"), true);
  assert.equal(canTransition("completed", "processing"), false);
  assert.equal(canTransition("failed", "processing"), false);
  assert.throws(() => assertTransition("cancelled", "completed"));
});

test("retryable errors are classified centrally and deterministically", () => {
  assert.equal(isRetryableErrorCode("PROVIDER_ERROR"), true);
  assert.equal(isRetryableErrorCode("PROVIDER_TIMEOUT"), true);
  assert.equal(isRetryableErrorCode("RATE_LIMITED"), true);
  assert.equal(isRetryableErrorCode("INVALID_URL"), false);
  assert.equal(isRetryableErrorCode("TRANSCRIPT_UNAVAILABLE"), false);
  assert.equal(isRetryableErrorCode(null), false);
});

test("retry policy is bounded and exponential", () => {
  assert.equal(JOB_RETRY_POLICY.maxAttempts, 3);
  assert.ok(retryDelayMs(1) >= 4_000 && retryDelayMs(1) <= 6_000);
  assert.ok(retryDelayMs(20) <= JOB_RETRY_POLICY.maxDelayMs * 1.2);
});

test("complete_transcript_job resolves transcript_id without the variable/column collision", {
  skip: process.env.SUPABASE_DB_TESTS !== "1" && "requires an explicitly selected disposable Supabase project",
}, () => {
  const jobId = "33333333-3333-3333-3333-333333333333";
  const sql = `
    delete from public.transcript_segments where transcript_id in (select id from public.transcripts where job_id='${jobId}');
    delete from public.transcripts where job_id='${jobId}';
    delete from public.transcript_jobs where id='${jobId}';
    insert into public.transcript_jobs (id, user_id, source_url, normalized_video_id, source_type, requested_language_code, provider, status, attempt_count, max_attempts, created_at, updated_at)
    values ('${jobId}', null, 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'aqz-KE-bpKQ', 'youtube', 'en', 'supadata', 'queued', 0, 3, now(), now())
    on conflict (id) do nothing;
    update public.transcript_jobs set status='processing', updated_at=now(), started_at=now(), last_error_code=null, last_error_message=null where id='${jobId}';
    select public.complete_transcript_job('${jobId}', 'aqz-KE-bpKQ', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'supadata', 'supadata', 'en', 'en', false, 'Thank you.', jsonb_build_array(jsonb_build_object('sequence_number', 0, 'start_ms', 181896, 'end_ms', 182896, 'text', 'Thank you.')));
    select id, status, selected_language_code from public.transcript_jobs where id='${jobId}';
  `;

  const result = supabaseJson(sql);
  const finalRow = result.rows[result.rows.length - 1];
  assert.equal(finalRow.status, "completed");
  assert.equal(finalRow.selected_language_code, "en");
});