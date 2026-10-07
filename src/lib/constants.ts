export const APP_NAME = "Sonnetra";
export const APP_DESCRIPTION =
  "A production-ready foundation for complete, searchable YouTube transcripts.";
export const API_VERSION = "v1";
export const MAX_YOUTUBE_URL_LENGTH = 2_048;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const REQUEST_ID_HEADER = "x-request-id";
export const MAX_REQUEST_ID_LENGTH = 128;
export const SUPADATA_API_URL = "https://api.supadata.ai/v1/transcript";
export const SUPADATA_TIMEOUT_MS = 30_000;
export const SUPADATA_MAX_RETRIES = 2;
export const TRANSCRIPT_JOB_POLL_INTERVAL_MS = 5_000;
export const TRANSCRIPT_JOB_POLL_MAX_ATTEMPTS = 120;

export const TRANSCRIPT_FORMATS = ["plain", "timestamps"] as const;
export const EXPORT_FORMATS = ["txt", "srt", "vtt", "json", "docx", "pdf"] as const;
export const JOB_STATES = [
  "queued",
  "processing",
  "completed",
  "failed",
  "retrying",
  "cancelled",
] as const;

export const PLAN_IDS = ["free", "premium"] as const;

export const RATE_LIMIT_DEFAULTS = {
  transcript: { limit: 10, windowMs: 60_000 },
  health: { limit: 60, windowMs: 60_000 },
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_URL: "INVALID_URL",
  UNSUPPORTED_URL: "UNSUPPORTED_URL",
  UNSUPPORTED_HOST: "UNSUPPORTED_HOST",
  MISSING_VIDEO_ID: "MISSING_VIDEO_ID",
  INVALID_VIDEO_ID: "INVALID_VIDEO_ID",
  MULTIPLE_URLS: "MULTIPLE_URLS",
  URL_TOO_LONG: "URL_TOO_LONG",
  UNSUPPORTED_PROTOCOL: "UNSUPPORTED_PROTOCOL",
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  PROVIDER_TIMEOUT: "PROVIDER_TIMEOUT",
  TRANSCRIPT_UNAVAILABLE: "TRANSCRIPT_UNAVAILABLE",
  TRANSCRIPT_INCOMPLETE: "TRANSCRIPT_INCOMPLETE",
  EXPORT_ERROR: "EXPORT_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  PROVIDER_AUTHENTICATION_ERROR: "PROVIDER_AUTHENTICATION_ERROR",
  PROVIDER_REQUEST_ERROR: "PROVIDER_REQUEST_ERROR",
  PROVIDER_MALFORMED_RESPONSE: "PROVIDER_MALFORMED_RESPONSE",
  TRANSCRIPT_EMPTY: "TRANSCRIPT_EMPTY",
  LANGUAGE_UNAVAILABLE: "LANGUAGE_UNAVAILABLE",
} as const;

export type JobState = (typeof JOB_STATES)[number];
export type ExportFormat = (typeof EXPORT_FORMATS)[number];
export type PlanId = (typeof PLAN_IDS)[number];
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];