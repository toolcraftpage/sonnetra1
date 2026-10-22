import assert from "node:assert/strict";
import test from "node:test";
import { ERROR_CODES } from "../src/lib/constants.ts";
import { AppError } from "../src/lib/errors.ts";
import { requestSupadataTranscript } from "../src/lib/providers/supadata-http.ts";

const response = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});

test("Supadata request uses canonical source, documented query fields, server key header, and request ID", async () => {
  let captured;
  const body = { lang: "am", content: [{ text: "ሰላም", offset: 0, duration: 1_000 }] };
  const result = await requestSupadataTranscript({
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    apiKey: "test-api-key-only-for-mocked-fetch",
    languageCode: "am",
    requestId: "request-test-01",
    fetcher: async (input, init) => {
      captured = { url: new URL(input), init };
      return response(body);
    },
  });

  assert.equal(captured.url.origin, "https://api.supadata.ai");
  assert.equal(captured.url.pathname, "/v1/transcript");
  assert.equal(captured.url.searchParams.get("url"), "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  assert.equal(captured.url.searchParams.get("mode"), "native");
  assert.equal(captured.url.searchParams.get("text"), "false");
  assert.equal(captured.url.searchParams.get("lang"), "am");
  assert.equal(captured.init.method, "GET");
  assert.equal(captured.init.headers["x-api-key"], "test-api-key-only-for-mocked-fetch");
  assert.equal(captured.init.headers["x-request-id"], "request-test-01");
  assert.ok(captured.init.signal instanceof AbortSignal);
  assert.deepEqual(result, body);
});

test("Supadata request retries a transient status within its configured bound", async () => {
  let attempts = 0;
  const result = await requestSupadataTranscript({
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    apiKey: "test-api-key-only-for-mocked-fetch",
    maxRetries: 1,
    fetcher: async () => ++attempts === 1 ? response({}, 503) : response({ lang: "en", content: [{ text: "Hello" }] }),
  });

  assert.equal(attempts, 2);
  assert.equal(result.lang, "en");
});

test("Supadata timeout aborts the request and maps to a safe timeout error", async () => {
  let observedAbort = false;
  await assert.rejects(
    () => requestSupadataTranscript({
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      apiKey: "test-api-key-only-for-mocked-fetch",
      timeoutMs: 5,
      maxRetries: 0,
      fetcher: (_input, init) => new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => {
          observedAbort = true;
          reject(new DOMException("private transport detail", "AbortError"));
        });
      }),
    }),
    (error) => error instanceof AppError && error.code === ERROR_CODES.PROVIDER_TIMEOUT && !error.message.includes("private transport detail"),
  );
  assert.equal(observedAbort, true);
});

test("provider statuses map to safe application errors without exposing response bodies", async () => {
  const cases = [
    [401, ERROR_CODES.PROVIDER_AUTHENTICATION_ERROR],
    [404, ERROR_CODES.TRANSCRIPT_UNAVAILABLE],
    [429, ERROR_CODES.RATE_LIMITED],
    [503, ERROR_CODES.PROVIDER_ERROR],
  ];

  for (const [status, code] of cases) {
    await assert.rejects(
      () => requestSupadataTranscript({
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        apiKey: "test-api-key-only-for-mocked-fetch",
        maxRetries: 0,
        fetcher: async () => response({ message: "private provider response" }, status),
      }),
      (error) => error instanceof AppError && error.code === code && !error.message.includes("private provider response"),
    );
  }
});

test("unavailable and still-processing responses map to distinct safe transcript errors", async () => {
  for (const [status, code] of [[206, ERROR_CODES.TRANSCRIPT_UNAVAILABLE]]) {
    await assert.rejects(
      () => requestSupadataTranscript({
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        apiKey: "test-api-key-only-for-mocked-fetch",
        fetcher: async () => response({ private: "provider response" }, status),
      }),
      (error) => error instanceof AppError && error.code === code && !error.message.includes("provider response"),
    );
  }
});

test("polls asynchronous Supadata jobs until a completed transcript is returned", async () => {
  const requests = [];
  const results = [
    response({ jobId: "provider-job-01" }, 202),
    response({ status: "queued" }),
    response({ status: "active" }),
    response({ status: "completed", lang: "am", content: [{ text: "ሰላም", offset: 0, duration: 1_000 }] }),
  ];
  const result = await requestSupadataTranscript({
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    apiKey: "test-api-key-only-for-mocked-fetch",
    pollIntervalMs: 0,
    fetcher: async (input, init) => {
      requests.push({ url: new URL(input), init });
      return results.shift();
    },
  });

  assert.equal(requests.length, 4);
  assert.ok(requests.slice(1).every(({ url }) => url.pathname === "/v1/transcript/provider-job-01"));
  assert.ok(requests.every(({ init }) => init.headers["x-api-key"] === "test-api-key-only-for-mocked-fetch"));
  assert.deepEqual(result, { lang: "am", content: [{ text: "ሰላም", offset: 0, duration: 1_000 }] });
});

test("bounds asynchronous polling and hides provider failure details", async () => {
  let attempts = 0;
  await assert.rejects(
    () => requestSupadataTranscript({
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      apiKey: "test-api-key-only-for-mocked-fetch",
      pollIntervalMs: 0,
      pollMaxAttempts: 1,
      fetcher: async () => {
        attempts += 1;
        return attempts === 1 ? response({ jobId: "provider-job-02" }, 202) : response({ status: "active" });
      },
    }),
    (error) => error instanceof AppError && error.code === ERROR_CODES.PROVIDER_TIMEOUT && error.retryable && !error.message.includes("provider-job-02"),
  );
  assert.equal(attempts, 2);

  let failurePolls = 0;
  await assert.rejects(
    () => requestSupadataTranscript({
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      apiKey: "test-api-key-only-for-mocked-fetch",
      pollIntervalMs: 0,
      fetcher: async () => ++failurePolls === 1
        ? response({ jobId: "provider-job-03" }, 202)
        : response({ status: "failed", error: { message: "private provider detail" } }),
    }),
    (error) => error instanceof AppError && error.code === ERROR_CODES.PROVIDER_ERROR && !error.message.includes("private provider detail"),
  );
});

test("HTTP 200 with malformed JSON is rejected instead of treated as a transcript", async () => {
  await assert.rejects(
    () => requestSupadataTranscript({
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      apiKey: "test-api-key-only-for-mocked-fetch",
      fetcher: async () => new Response("not-json", { status: 200 }),
    }),
    (error) => error instanceof AppError && error.code === ERROR_CODES.PROVIDER_MALFORMED_RESPONSE,
  );
});