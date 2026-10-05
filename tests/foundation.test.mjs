import assert from "node:assert/strict";
import test from "node:test";
import { errorResponse, successResponse } from "../src/lib/api-response.ts";
import { ERROR_CODES } from "../src/lib/constants.ts";
import { readFileSync } from "node:fs";
import { AppError, serializeError } from "../src/lib/errors.ts";
import { ProviderRegistry, } from "../src/lib/providers/transcript.ts";
import { createRequestId, getRequestId } from "../src/lib/request-id.ts";
import { DevelopmentRateLimiter } from "../src/lib/rate-limit.ts";
import { normalizeInput, validateYouTubeUrl } from "../src/lib/security.ts";
import { formatTranscriptForCopy } from "../src/lib/transcript-copy.ts";
import { countMatches, getVisibleSegments } from "../src/lib/transcript-search.ts";
import { isWorkerRequestAuthorized } from "../src/server/worker-auth.ts";

test("request IDs accept safe incoming IDs and reject malformed values", () => {
  const request = new Request("http://localhost/api/health", {
    headers: { "x-request-id": "client-request-01" },
  });
  assert.equal(getRequestId(request), "client-request-01");
  assert.match(createRequestId(), /^[0-9a-f-]{36}$/);
  assert.match(getRequestId(new Request("http://localhost")), /^[0-9a-f-]{36}$/);
});

test("errors serialize into a stable redacted API contract", async () => {
  const error = new AppError(ERROR_CODES.PROVIDER_ERROR, "Provider is unavailable.", {
    statusCode: 503,
    retryable: true,
    cause: { secret: "must not escape" },
  });
  const serialized = serializeError(error, "request-123");
  assert.deepEqual(serialized, {
    success: false,
    error: {
      code: ERROR_CODES.PROVIDER_ERROR,
      message: "Provider is unavailable.",
      requestId: "request-123",
      retryable: true,
    },
  });
  const response = errorResponse(error, "request-123");
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("x-request-id"), "request-123");
  assert.equal((await response.json()).error.requestId, "request-123");
});

test("worker authorization accepts both direct secret headers and Vercel cron bearer tokens", () => {
  const routeSource = readFileSync(new URL("../src/app/api/internal/worker/route.ts", import.meta.url), "utf8");
  const authSource = readFileSync(new URL("../src/server/worker-auth.ts", import.meta.url), "utf8");
  const serverConfig = readFileSync(new URL("../src/lib/config/server.ts", import.meta.url), "utf8");
  const vercelConfig = readFileSync(new URL("../vercel.json", import.meta.url), "utf8");

  assert.match(authSource, /x-worker-secret/i);
  assert.match(authSource, /authorization/i);
  assert.match(serverConfig, /CRON_SECRET/);
  assert.match(routeSource, /export async function GET/);
  assert.match(vercelConfig, /"path"\s*:\s*"\/api\/internal\/worker"/);
});

test("cron GET authorization only accepts CRON_SECRET bearer tokens", () => {
  const secrets = { cronSecret: "test-cron-secret", workerSecret: "test-worker-secret" };
  const request = (headers = {}) => new Request("https://sonnetra.vercel.app/api/internal/worker", { headers });

  assert.equal(isWorkerRequestAuthorized(request(), "cron", secrets), false);
  assert.equal(isWorkerRequestAuthorized(request({ authorization: "Bearer wrong-secret" }), "cron", secrets), false);
  assert.equal(isWorkerRequestAuthorized(request({ authorization: "Bearer test-worker-secret" }), "cron", secrets), false);
  assert.equal(isWorkerRequestAuthorized(request({ "x-worker-secret": "test-cron-secret" }), "cron", secrets), false);
  assert.equal(isWorkerRequestAuthorized(request({ authorization: "Bearer test-cron-secret" }), "cron", secrets), true);
});

test("protected POST authorization only accepts WORKER_SECRET", () => {
  const secrets = { cronSecret: "test-cron-secret", workerSecret: "test-worker-secret" };
  const request = (headers = {}) => new Request("https://sonnetra.vercel.app/api/internal/worker", { headers });

  assert.equal(isWorkerRequestAuthorized(request(), "worker", secrets), false);
  assert.equal(isWorkerRequestAuthorized(request({ "x-worker-secret": "wrong-secret" }), "worker", secrets), false);
  assert.equal(isWorkerRequestAuthorized(request({ authorization: "Bearer test-cron-secret" }), "worker", secrets), false);
  assert.equal(isWorkerRequestAuthorized(request({ "x-worker-secret": "test-worker-secret" }), "worker", secrets), true);
  assert.equal(isWorkerRequestAuthorized(request({ authorization: "Bearer test-worker-secret" }), "worker", secrets), true);
});

test("worker route maps GET to cron auth and POST to worker auth", () => {
  const routeSource = readFileSync(new URL("../src/app/api/internal/worker/route.ts", import.meta.url), "utf8");

  assert.match(routeSource, /handleWorkerRequest\(request, false\)/);
  assert.match(routeSource, /handleWorkerRequest\(request, true\)/);
  assert.match(routeSource, /allowExactJob\s*\?\s*"worker"\s*:\s*"cron"/i);
});

test("provider and transcript failures map to stable HTTP statuses", () => {
  assert.equal(new AppError(ERROR_CODES.RATE_LIMITED, "Limited.").statusCode, 429);
  assert.equal(new AppError(ERROR_CODES.PROVIDER_TIMEOUT, "Timed out.").statusCode, 504);
  assert.equal(new AppError(ERROR_CODES.PROVIDER_ERROR, "Unavailable.").statusCode, 503);
  assert.equal(new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "Malformed.").statusCode, 502);
  assert.equal(new AppError(ERROR_CODES.TRANSCRIPT_EMPTY, "Empty.").statusCode, 422);
  assert.equal(new AppError(ERROR_CODES.TRANSCRIPT_UNAVAILABLE, "Unavailable.").statusCode, 422);
});

test("success responses preserve the request ID in body and header", async () => {
  const response = successResponse({ ready: true }, { requestId: "request-456" });
  assert.equal(response.headers.get("x-request-id"), "request-456");
  assert.deepEqual(await response.json(), {
    success: true,
    data: { ready: true },
    requestId: "request-456",
  });
});

test("security utilities preserve Unicode and validate YouTube hostnames", () => {
  assert.equal(normalizeInput("  Hello ሰላም  "), "Hello ሰላም");
  assert.equal(validateYouTubeUrl("https://youtu.be/video-id").hostname, "youtu.be");
  assert.throws(() => validateYouTubeUrl("https://example.com/video"), AppError);
});

test("transcript copy formatting preserves full text, Unicode, and line breaks", () => {
  const text = "Hello ሰላም\nSecond line\n".repeat(400);
  assert.equal(formatTranscriptForCopy(text, [{ text: "ignored segment" }]), text);
  assert.equal(formatTranscriptForCopy(null, [{ text: "ሰላም" }, { text: "Second line" }]), "ሰላም\nSecond line");
  assert.equal(formatTranscriptForCopy("", []), "");
});

test("provider registry stays empty until a real provider is supplied", () => {
  const registry = new ProviderRegistry();
  assert.equal(registry.list().length, 0);
  assert.equal(registry.get("supadata"), undefined);
});

test("transcript search helper respects case-insensitive Unicode text matching", () => {
  const segments = [
    { text: "Hello ሰላም from the studio" },
    { text: "Second line with focus" },
    { text: "A final line" },
  ];
  assert.equal(countMatches(segments, "HELLO"), 1);
  assert.equal(countMatches(segments, "ሰላም"), 1);
  assert.equal(getVisibleSegments(segments, "line").length, 2);
  assert.equal(getVisibleSegments(segments, "studio")[0].text, "Hello ሰላም from the studio");
});

test("development limiter reports remaining capacity and retry information", async () => {
  const limiter = new DevelopmentRateLimiter();
  assert.equal((await limiter.check("test", 2, 60_000)).allowed, true);
  assert.equal((await limiter.check("test", 2, 60_000)).remaining, 0);
  const blocked = await limiter.check("test", 2, 60_000);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds);
});

test("development limiter rejects invalid limits and windows", async () => {
  const limiter = new DevelopmentRateLimiter();
  await assert.rejects(() => limiter.check("test", -1, 60_000), RangeError);
  await assert.rejects(() => limiter.check("test", 2, 0), RangeError);
  await assert.rejects(() => limiter.check("test", Number.NaN, 60_000), RangeError);
});