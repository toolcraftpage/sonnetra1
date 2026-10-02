import { ERROR_CODES } from "../constants.ts";
import { AppError } from "../errors.ts";
import type { TranscriptLanguage, TranscriptMetadata, TranscriptSegment } from "../../types/domain.ts";
import type { TranscriptResult } from "./transcript";

export type SupadataChunk = {
  text?: unknown;
  offset?: unknown;
  duration?: unknown;
  lang?: unknown;
};

export type SupadataTranscriptResponse = {
  content?: unknown;
  lang?: unknown;
  availableLangs?: unknown;
};

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function normalizeSupadataResponse(
  response: SupadataTranscriptResponse,
  request: { videoId: string; sourceUrl: string; languageCode?: string },
): TranscriptResult {
  if (!response || !Array.isArray(response.content)) {
    throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned a malformed response.");
  }
  if (!response.content.length) {
    throw new AppError(ERROR_CODES.TRANSCRIPT_EMPTY, "The transcript provider returned an empty transcript.");
  }
  const languageCode = typeof response.lang === "string" && response.lang ? response.lang : undefined;
  if (!languageCode) {
    throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned an incomplete response.");
  }
  if (request.languageCode && request.languageCode.toLowerCase() !== languageCode.toLowerCase()) {
    throw new AppError(ERROR_CODES.LANGUAGE_UNAVAILABLE, "A transcript is not available in the requested language.");
  }
  const segments: TranscriptSegment[] = [];
  let previousStart = -1;

  for (const [index, chunk] of response.content.entries()) {
    if (!chunk || typeof chunk !== "object") {
      throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned a malformed segment.");
    }
    const item = chunk as SupadataChunk;
    if (typeof item.text !== "string" || !item.text.trim()) {
      throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned a malformed segment.");
    }
    const startMs = finiteNumber(item.offset);
    const durationMs = finiteNumber(item.duration);
    const endMs = startMs !== undefined && durationMs !== undefined ? startMs + durationMs : undefined;
    if (startMs !== undefined && (startMs < 0 || startMs < previousStart)) {
      throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned invalid segment timing.");
    }
    if (durationMs !== undefined && (durationMs < 0 || (endMs !== undefined && endMs < startMs!))) {
      throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned invalid segment timing.");
    }
    if (typeof item.lang === "string" && languageCode && item.lang !== languageCode) {
      throw new AppError(ERROR_CODES.PROVIDER_MALFORMED_RESPONSE, "The transcript provider returned inconsistent language data.");
    }
    segments.push({ index, text: item.text, ...(startMs !== undefined ? { startMs } : {}), ...(endMs !== undefined ? { endMs } : {}) });
    if (startMs !== undefined) previousStart = startMs;
  }

  if (!segments.length) {
    throw new AppError(ERROR_CODES.TRANSCRIPT_EMPTY, "The transcript provider returned an empty transcript.");
  }
  const language: TranscriptLanguage = { code: languageCode, name: languageCode };
  const metadata: TranscriptMetadata = { videoId: request.videoId, canonicalUrl: request.sourceUrl };
  return { language, metadata, segments };
}