import { ERROR_CODES, MAX_YOUTUBE_URL_LENGTH } from "./constants.ts";
import { AppError } from "./errors.ts";
import { YOUTUBE_HOSTS } from "./youtube-url.ts";

const youtubeHosts = new Set<string>(YOUTUBE_HOSTS);

export function requireString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `${field} is invalid.`,
    );
  }
  return value.trim();
}

export function validateYouTubeUrl(value: unknown): URL {
  const input = requireString(value, "YouTube URL", MAX_YOUTUBE_URL_LENGTH);
  let url: URL;
  try {
    url = new URL(input);
  } catch (cause) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "YouTube URL is invalid.", {
      cause,
    });
  }

  if (url.protocol !== "https:" || !youtubeHosts.has(url.hostname)) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "Only secure YouTube URLs are supported.",
    );
  }

  return url;
}

export function normalizeInput(value: string): string {
  return value.normalize("NFC").trim();
}

export async function parseJsonBody<T>(
  request: Request,
  maxBytes = 32_768,
): Promise<T> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Request body is too large.");
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maxBytes) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Request body is too large.");
    }
    body = JSON.parse(rawBody) as unknown;
  } catch (cause) {
    if (cause instanceof AppError) throw cause;
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Request body must be valid JSON.", {
      cause,
    });
  }

  return body as T;
}