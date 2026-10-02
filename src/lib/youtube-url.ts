import { MAX_YOUTUBE_URL_LENGTH, type ErrorCode } from "./constants.ts";
import { AppError } from "./errors.ts";

export const YOUTUBE_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
] as const;

export type YouTubeSourceType = "watch" | "short" | "shorts" | "embed" | "live";

export type YouTubeUrlParseSuccess = {
  valid: true;
  videoId: string;
  canonicalUrl: string;
  sourceType: YouTubeSourceType;
  originalUrl: string;
};

export type YouTubeUrlParseFailure = {
  valid: false;
  code: YouTubeUrlErrorCode;
  message: string;
  originalUrl?: string;
};

export type YouTubeUrlParseResult = YouTubeUrlParseSuccess | YouTubeUrlParseFailure;
export type YouTubeUrlErrorCode = Extract<
  ErrorCode,
  | "INVALID_URL"
  | "UNSUPPORTED_URL"
  | "UNSUPPORTED_HOST"
  | "MISSING_VIDEO_ID"
  | "INVALID_VIDEO_ID"
  | "MULTIPLE_URLS"
  | "URL_TOO_LONG"
  | "UNSUPPORTED_PROTOCOL"
>;

const controlCharacterPattern = /[\u0000-\u001f\u007f]/u;
const schemePattern = /^[a-z][a-z\d+.-]*:/iu;
const urlSchemePattern = /(?:https?|javascript|data|file):\/\//giu;
const videoIdPattern = /^[A-Za-z0-9_-]{11}$/u;

const failureMessages: Record<YouTubeUrlErrorCode, string> = {
  INVALID_URL: "Enter a complete YouTube URL.",
  UNSUPPORTED_URL: "This YouTube URL format is not supported.",
  UNSUPPORTED_HOST: "Only youtube.com and youtu.be URLs are supported.",
  MISSING_VIDEO_ID: "The YouTube URL does not contain a video ID.",
  INVALID_VIDEO_ID: "The YouTube video ID is invalid.",
  MULTIPLE_URLS: "Enter one YouTube URL at a time.",
  URL_TOO_LONG: "The YouTube URL is too long.",
  UNSUPPORTED_PROTOCOL: "Only HTTP and HTTPS YouTube URLs are supported.",
};

function failure(code: YouTubeUrlErrorCode, originalUrl?: string): YouTubeUrlParseFailure {
  return { valid: false, code, message: failureMessages[code], ...(originalUrl ? { originalUrl } : {}) };
}

function throwForFailure(result: YouTubeUrlParseFailure): never {
  throw new AppError(result.code, result.message);
}

function classifyPath(pathname: string): { sourceType: YouTubeSourceType; id?: string } | undefined {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1 && segments[0] === "watch") return { sourceType: "watch" };
  if (segments.length === 2 && ["shorts", "embed", "live"].includes(segments[0])) {
    return { sourceType: segments[0] as "shorts" | "embed" | "live", id: segments[1] };
  }
  return undefined;
}

function extractShortId(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 1 ? segments[0] : undefined;
}

/** Parses without network access using YouTube's 11-character video ID format. */
export function parseYouTubeUrl(value: unknown): YouTubeUrlParseResult {
  try {
    if (typeof value !== "string") return failure("INVALID_URL");
    if (controlCharacterPattern.test(value)) return failure("INVALID_URL", value.trim());
    const originalUrl = value.trim();
    if (!originalUrl) return failure("INVALID_URL");
    if (originalUrl.length > MAX_YOUTUBE_URL_LENGTH) return failure("URL_TOO_LONG", originalUrl);
    if ([...originalUrl.matchAll(urlSchemePattern)].length > 1) return failure("MULTIPLE_URLS", originalUrl);
    if (!schemePattern.test(originalUrl)) return failure("INVALID_URL", originalUrl);

    let url: URL;
    try {
      url = new URL(originalUrl);
    } catch {
      return failure("INVALID_URL", originalUrl);
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") return failure("UNSUPPORTED_PROTOCOL", originalUrl);
    if (!YOUTUBE_HOSTS.includes(url.hostname as (typeof YOUTUBE_HOSTS)[number])) return failure("UNSUPPORTED_HOST", originalUrl);
    const authority = originalUrl.match(/^[a-z][a-z\d+.-]*:\/\/([^/?#]*)/iu)?.[1] ?? "";
    const authorityHost = authority.slice(authority.lastIndexOf("@") + 1);
    if (url.username || url.password || authorityHost.includes(":") || url.hash) return failure("UNSUPPORTED_URL", originalUrl);

    let sourceType: YouTubeSourceType;
    let videoId: string | undefined;
    if (url.hostname === "youtu.be") {
      sourceType = "short";
      videoId = extractShortId(url.pathname);
    } else {
      const path = classifyPath(url.pathname);
      if (!path) return failure("UNSUPPORTED_URL", originalUrl);
      sourceType = path.sourceType;
      videoId = path.id ?? url.searchParams.get("v") ?? undefined;
      if (sourceType !== "watch" && url.searchParams.has("v")) return failure("UNSUPPORTED_URL", originalUrl);
    }

    if (!videoId) return failure("MISSING_VIDEO_ID", originalUrl);
    if (!videoIdPattern.test(videoId)) return failure("INVALID_VIDEO_ID", originalUrl);
    return {
      valid: true,
      videoId,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      sourceType,
      originalUrl,
    };
  } catch {
    return failure("INVALID_URL");
  }
}

export function parseYouTubeUrlOrThrow(value: unknown): YouTubeUrlParseSuccess {
  const result = parseYouTubeUrl(value);
  return result.valid ? result : throwForFailure(result);
}
