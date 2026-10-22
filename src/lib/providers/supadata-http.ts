import { ERROR_CODES, SUPADATA_API_URL, SUPADATA_MAX_RETRIES, SUPADATA_TIMEOUT_MS } from "../constants.ts";
import { AppError } from "../errors.ts";
import type { SupadataTranscriptResponse } from "./supadata-normalizer.ts";

type FetchLike = typeof fetch;

type SupadataRequestOptions = {
  sourceUrl: string;
  apiKey: string;
  languageCode?: string;
  requestId?: string;
  fetcher?: FetchLike;
  timeoutMs?: number;
  maxRetries?: number;
  pollIntervalMs?: number;
  pollMaxAttempts?: number;
  pollTimeoutMs?: number;
};

type SupadataJobStatusResponse = {
  status?: unknown;
  error?: unknown;
  content?: unknown;
  lang?: unknown;
  availableLangs?: unknown;
};

function retryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function waitBeforeRetry(attempt: number): Promise<void> {
  const delayMs = Math.min(1_000, 200 * 2 ** attempt) + Math.floor(Math.random() * 100);
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json() as unknown;
  } catch {
    throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned a malformed response.");
  }
}

function providerTimeout(): AppError {
  return new AppError(ERROR_CODES.PROVIDER_TIMEOUT, "The transcript provider timed out.", { retryable: true });
}

async function pollTranscriptJob({
  jobId,
  apiKey,
  requestId,
  fetcher,
  timeoutMs,
  pollIntervalMs,
  pollMaxAttempts,
  pollTimeoutMs,
}: {
  jobId: string;
  apiKey: string;
  requestId?: string;
  fetcher: FetchLike;
  timeoutMs: number;
  pollIntervalMs: number;
  pollMaxAttempts: number;
  pollTimeoutMs: number;
}): Promise<SupadataTranscriptResponse> {
  const jobUrl = new URL(`${SUPADATA_API_URL}/${encodeURIComponent(jobId)}`);
  const deadline = Date.now() + pollTimeoutMs;

  for (let attempt = 0; attempt < pollMaxAttempts; attempt += 1) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) throw providerTimeout();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(timeoutMs, remainingMs));
    let response: Response;
    try {
      response = await fetcher(jobUrl, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          accept: "application/json",
          ...(requestId ? { "x-request-id": requestId } : {}),
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) throw providerTimeout();
      throw new AppError(ERROR_CODES.PROVIDER_ERROR, "The transcript provider could not be reached.", { statusCode: 503, retryable: true, cause: error });
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AppError(ERROR_CODES.PROVIDER_AUTHENTICATION_ERROR, "The transcript provider rejected its credentials.");
    }
    if (response.status === 429) {
      throw new AppError(ERROR_CODES.RATE_LIMITED, "The transcript provider is rate limited.", { statusCode: 429, retryable: true });
    }
    if (response.status === 408 || response.status >= 500) throw providerTimeout();
    if (!response.ok) {
      throw new AppError(ERROR_CODES.PROVIDER_REQUEST_ERROR, "The transcript provider rejected the request.", { statusCode: 502 });
    }

    const result = await readJson(response) as SupadataJobStatusResponse;
    if (!result || typeof result !== "object" || typeof result.status !== "string") {
      throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned a malformed job status.");
    }
    if (result.status === "completed") {
      const transcript = { ...result };
      delete transcript.status;
      return transcript as SupadataTranscriptResponse;
    }
    if (result.status === "failed") {
      throw new AppError(ERROR_CODES.PROVIDER_ERROR, "The transcript provider could not complete the transcript job.", { retryable: true });
    }
    if (result.status !== "queued" && result.status !== "active") {
      throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned an unknown job status.");
    }

    const remainingAfterPollMs = deadline - Date.now();
    if (attempt + 1 >= pollMaxAttempts || remainingAfterPollMs <= 0) throw providerTimeout();
    await wait(Math.min(pollIntervalMs, remainingAfterPollMs));
  }

  throw providerTimeout();
}

export async function requestSupadataTranscript({
  sourceUrl,
  apiKey,
  languageCode,
  requestId,
  fetcher = fetch,
  timeoutMs = SUPADATA_TIMEOUT_MS,
  maxRetries = SUPADATA_MAX_RETRIES,
  pollIntervalMs = 1_000,
  pollMaxAttempts = 20,
  pollTimeoutMs = 15_000,
}: SupadataRequestOptions): Promise<SupadataTranscriptResponse> {
  const url = new URL(SUPADATA_API_URL);
  url.searchParams.set("url", sourceUrl);
  url.searchParams.set("text", "false");
  url.searchParams.set("mode", "native");
  if (languageCode) url.searchParams.set("lang", languageCode);

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(url, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          accept: "application/json",
          ...(requestId ? { "x-request-id": requestId } : {}),
        },
        signal: controller.signal,
      });
      if (response.status === 206) throw new AppError(ERROR_CODES.TRANSCRIPT_UNAVAILABLE, "A transcript is not available for this video.");
      if (response.status === 202) {
        const result = await readJson(response) as { jobId?: unknown };
        if (!result || typeof result !== "object" || typeof result.jobId !== "string" || !result.jobId.trim()) {
          throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned a malformed job response.");
        }
        return pollTranscriptJob({ jobId: result.jobId, apiKey, requestId, fetcher, timeoutMs, pollIntervalMs, pollMaxAttempts, pollTimeoutMs });
      }
      if (response.ok) {
        return await readJson(response) as SupadataTranscriptResponse;
      }
      if (response.status === 401 || response.status === 403) throw new AppError(ERROR_CODES.PROVIDER_AUTHENTICATION_ERROR, "The transcript provider rejected its credentials.");
      if (response.status === 404) throw new AppError(ERROR_CODES.TRANSCRIPT_UNAVAILABLE, "A transcript is not available for this video.");
      if (response.status === 408 && attempt === maxRetries) {
        throw new AppError(ERROR_CODES.PROVIDER_TIMEOUT, "The transcript provider timed out.", { retryable: true });
      }
      if (response.status === 429 && attempt === maxRetries) {
        throw new AppError(ERROR_CODES.RATE_LIMITED, "The transcript provider is rate limited.", { statusCode: 429, retryable: true });
      }
      if (response.status >= 500 && attempt === maxRetries) {
        throw new AppError(ERROR_CODES.PROVIDER_ERROR, "The transcript provider is unavailable.", { statusCode: 503, retryable: true });
      }
      if (!retryableStatus(response.status)) {
        throw new AppError(ERROR_CODES.PROVIDER_REQUEST_ERROR, "The transcript provider rejected the request.", { statusCode: 502 });
      }
      await waitBeforeRetry(attempt);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (controller.signal.aborted) {
        if (attempt === maxRetries) throw new AppError(ERROR_CODES.PROVIDER_TIMEOUT, "The transcript provider timed out.", { retryable: true });
      } else if (attempt === maxRetries) {
        throw new AppError(ERROR_CODES.PROVIDER_ERROR, "The transcript provider could not be reached.", { statusCode: 503, retryable: true, cause: error });
      }
      await waitBeforeRetry(attempt);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new AppError(ERROR_CODES.PROVIDER_ERROR, "The transcript provider is unavailable.");
}