import assert from "node:assert/strict";
import test from "node:test";
import { assertTransition, canTransition, isRetryableErrorCode, JOB_RETRY_POLICY, retryDelayMs } from "../src/server/job-state.ts";
import { validateDisposableProjectRef } from "./helpers/supabase-test-target.mjs";

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

test("disposable Supabase target must match explicit reference and configured URL", () => {
  const projectRef = "abcdefghijklmnopqrst";
  const url = `https://${projectRef}.supabase.co`;

  assert.equal(validateDisposableProjectRef(projectRef, url), projectRef);
  assert.throws(() => validateDisposableProjectRef(projectRef, "https://other-project.supabase.co"));
  assert.throws(() => validateDisposableProjectRef("", url));
  assert.throws(() => validateDisposableProjectRef(projectRef, `http://${projectRef}.supabase.co`));
  assert.throws(() => validateDisposableProjectRef(projectRef, `https://${projectRef}.supabase.co.evil.example`));
});
