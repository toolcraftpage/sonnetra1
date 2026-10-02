import "server-only";

import { logger } from "@/lib/logger";
import { getSupadataConfiguration } from "@/lib/config/server";
import { ERROR_CODES, SUPADATA_API_URL, SUPADATA_MAX_RETRIES, SUPADATA_TIMEOUT_MS } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { normalizeSupadataResponse, type SupadataTranscriptResponse } from "./supadata-normalizer";
import type { TranscriptLanguage } from "@/types/domain";
import type { TranscriptProvider, TranscriptRequest, TranscriptResult } from "./transcript";

type FetchLike = typeof fetch;

function retryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function waitBeforeRetry(attempt: number): Promise<void> {
  const delayMs = Math.min(1_000, 200 * 2 ** attempt) + Math.floor(Math.random() * 100);
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export class SupadataTranscriptProvider implements TranscriptProvider {
  readonly id = "supadata";
  readonly capabilities = { languages: true, timestamps: true, metadata: false } as const;
  private readonly fetcher: FetchLike;

  constructor(fetcher: FetchLike = fetch) {
    this.fetcher = fetcher;
  }

  preflight() {
    return getSupadataConfiguration().status;
  }

  async listLanguages(request: Pick<TranscriptRequest, "videoId" | "sourceUrl" | "requestId">): Promise<readonly TranscriptLanguage[]> {
    const result = await this.request(request.sourceUrl, undefined, request.requestId);
    const languages = Array.isArray(result.availableLangs) ? result.availableLangs : [];
    return languages.filter((code): code is string => typeof code === "string").map((code) => ({ code, name: code }));
  }

  async retrieve(request: TranscriptRequest): Promise<TranscriptResult> {
    const startedAt = Date.now();
    const result = await this.request(request.sourceUrl, request.languageCode, request.requestId);
    const normalized = normalizeSupadataResponse(result, request);
    logger.info("Transcript provider completed", { provider: this.id, videoId: request.videoId, durationMs: Date.now() - startedAt, event: "transcript_complete" });
    return { ...normalized, providerReference: this.id };
  }

  private async request(sourceUrl: string, languageCode?: string, requestId?: string): Promise<SupadataTranscriptResponse> {
    const configuration = getSupadataConfiguration();
    if (configuration.status !== "CONFIGURED" || !configuration.apiKey) {
      throw new AppError(ERROR_CODES.CONFIGURATION_ERROR, "The Supadata transcript provider is not configured.", { statusCode: 503 });
    }
    const url = new URL(SUPADATA_API_URL);
    url.searchParams.set("url", sourceUrl);
    url.searchParams.set("text", "false");
    url.searchParams.set("mode", "native");
    if (languageCode) url.searchParams.set("lang", languageCode);

    for (let attempt = 0; attempt <= SUPADATA_MAX_RETRIES; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), SUPADATA_TIMEOUT_MS);
      try {
        const response = await this.fetcher(url, { method: "GET", headers: { "x-api-key": configuration.apiKey, accept: "application/json", ...(requestId ? { "x-request-id": requestId } : {}) }, signal: controller.signal });
        if (response.status === 206) throw new AppError(ERROR_CODES.TRANSCRIPT_UNAVAILABLE, "A transcript is not available for this video.");
        if (response.status === 202) throw new AppError(ERROR_CODES.TRANSCRIPT_INCOMPLETE, "The transcript is still processing and is not available yet.");
        if (response.ok) {
          try {
            return await response.json() as SupadataTranscriptResponse;
          } catch {
            throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned a malformed response.");
          }
        }
        if (response.status === 401 || response.status === 403) throw new AppError(ERROR_CODES.PROVIDER_AUTHENTICATION_ERROR, "The transcript provider rejected its credentials.");
        if (response.status === 404) throw new AppError(ERROR_CODES.TRANSCRIPT_UNAVAILABLE, "A transcript is not available for this video.");
        if (response.status === 408 && attempt === SUPADATA_MAX_RETRIES) {
          throw new AppError(ERROR_CODES.PROVIDER_TIMEOUT, "The transcript provider timed out.", { retryable: true });
        }
        if (response.status === 429 && attempt === SUPADATA_MAX_RETRIES) {
          throw new AppError(ERROR_CODES.RATE_LIMITED, "The transcript provider is rate limited.", { statusCode: 429, retryable: true });
        }
        if (response.status >= 500 && attempt === SUPADATA_MAX_RETRIES) {
          throw new AppError(ERROR_CODES.PROVIDER_ERROR, "The transcript provider is unavailable.", { statusCode: 503, retryable: true });
        }
        if (!retryableStatus(response.status)) {
          throw new AppError(ERROR_CODES.PROVIDER_REQUEST_ERROR, "The transcript provider rejected the request.", { statusCode: 502 });
        }
        await waitBeforeRetry(attempt);
      } catch (error) {
        if (error instanceof AppError) throw error;
        if (controller.signal.aborted) {
          if (attempt === SUPADATA_MAX_RETRIES) throw new AppError(ERROR_CODES.PROVIDER_TIMEOUT, "The transcript provider timed out.", { retryable: true });
        } else if (attempt === SUPADATA_MAX_RETRIES) {
          throw new AppError(ERROR_CODES.PROVIDER_ERROR, "The transcript provider could not be reached.", { statusCode: 503, retryable: true, cause: error });
        }
        await waitBeforeRetry(attempt);
      } finally {
        clearTimeout(timer);
      }
    }
    throw new AppError(ERROR_CODES.PROVIDER_ERROR, "The transcript provider is unavailable.");
  }
}