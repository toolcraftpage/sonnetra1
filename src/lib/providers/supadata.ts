import "server-only";

import { logger } from "@/lib/logger";
import { getSupadataConfiguration } from "@/lib/config/server";
import { ERROR_CODES } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { canonicalYouTubeSourceUrl } from "@/lib/youtube-url";
import { normalizeSupadataResponse, type SupadataTranscriptResponse } from "./supadata-normalizer";
import { requestSupadataTranscript } from "./supadata-http";
import type { TranscriptLanguage } from "@/types/domain";
import type { TranscriptProvider, TranscriptRequest, TranscriptResult } from "./transcript";

type FetchLike = typeof fetch;

export class SupadataTranscriptProvider implements TranscriptProvider {
  readonly id = "supadata";
  readonly capabilities = { languages: true, timestamps: true, metadata: false } as const;
  private readonly fetcher: typeof fetch;

  constructor(fetcher: FetchLike = fetch) {
    this.fetcher = fetcher;
  }

  preflight() {
    return getSupadataConfiguration().status;
  }

  async listLanguages(request: Pick<TranscriptRequest, "videoId" | "sourceUrl" | "requestId">): Promise<readonly TranscriptLanguage[]> {
    const sourceUrl = canonicalYouTubeSourceUrl(request.videoId, request.sourceUrl);
    const result = await this.request(sourceUrl, undefined, request.requestId);
    const languages = Array.isArray(result.availableLangs) ? result.availableLangs : [];
    return languages.filter((code): code is string => typeof code === "string").map((code) => ({ code, name: code }));
  }

  async retrieve(request: TranscriptRequest): Promise<TranscriptResult> {
    const startedAt = Date.now();
    const sourceUrl = canonicalYouTubeSourceUrl(request.videoId, request.sourceUrl);
    const result = await this.request(sourceUrl, request.languageCode, request.requestId);
    const normalized = normalizeSupadataResponse(result, { ...request, sourceUrl });
    logger.info("Transcript provider completed", { requestId: request.requestId, workerRunId: request.workerRunId, provider: this.id, videoId: request.videoId, durationMs: Date.now() - startedAt, event: "transcript_complete" });
    return { ...normalized, providerReference: this.id };
  }

  private async request(sourceUrl: string, languageCode?: string, requestId?: string): Promise<SupadataTranscriptResponse> {
    const configuration = getSupadataConfiguration();
    if (configuration.status !== "CONFIGURED" || !configuration.apiKey) {
      throw new AppError(ERROR_CODES.CONFIGURATION_ERROR, "The Supadata transcript provider is not configured.", { statusCode: 503 });
    }
    return requestSupadataTranscript({
      sourceUrl,
      apiKey: configuration.apiKey,
      languageCode,
      requestId,
      fetcher: this.fetcher,
    });
  }
}