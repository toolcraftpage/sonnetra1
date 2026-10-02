import { ERROR_CODES, type ErrorCode } from "./constants.ts";
import type { ApiError } from "../types/domain";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly retryable: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    options: { statusCode?: number; retryable?: boolean; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = code;
    this.statusCode = options.statusCode ?? statusForCode(code);
    this.retryable = options.retryable ?? false;
  }
}

export function configurationError(message: string): AppError {
  return new AppError(ERROR_CODES.CONFIGURATION_ERROR, message, {
    statusCode: 503,
  });
}

export function serializeError(error: unknown, requestId: string): ApiError {
  const appError = error instanceof AppError ? error : undefined;
  return {
    success: false,
    error: {
      code: appError?.code ?? ERROR_CODES.INTERNAL_ERROR,
      message: appError?.message ?? "An unexpected error occurred.",
      requestId,
      retryable: appError?.retryable ?? false,
    },
  };
}

function statusForCode(code: ErrorCode): number {
  if (
    code === ERROR_CODES.VALIDATION_ERROR ||
    code === ERROR_CODES.INVALID_URL ||
    code === ERROR_CODES.UNSUPPORTED_URL ||
    code === ERROR_CODES.UNSUPPORTED_HOST ||
    code === ERROR_CODES.MISSING_VIDEO_ID ||
    code === ERROR_CODES.INVALID_VIDEO_ID ||
    code === ERROR_CODES.MULTIPLE_URLS ||
    code === ERROR_CODES.URL_TOO_LONG ||
    code === ERROR_CODES.UNSUPPORTED_PROTOCOL
  ) return 400;
  if (code === ERROR_CODES.AUTHENTICATION_REQUIRED) return 401;
  if (code === ERROR_CODES.AUTHORIZATION_ERROR) return 403;
  if (code === ERROR_CODES.NOT_FOUND) return 404;
  if (code === ERROR_CODES.CONFLICT) return 409;
  if (code === ERROR_CODES.RATE_LIMITED) return 429;
  if (code === ERROR_CODES.CONFIGURATION_ERROR) return 503;
  if (code === ERROR_CODES.PROVIDER_TIMEOUT) return 504;
  if (code === ERROR_CODES.PROVIDER_ERROR) return 503;
  if (
    code === ERROR_CODES.PROVIDER_AUTHENTICATION_ERROR ||
    code === ERROR_CODES.PROVIDER_REQUEST_ERROR ||
    code === ERROR_CODES.PROVIDER_MALFORMED_RESPONSE
  ) return 502;
  if (
    code === ERROR_CODES.TRANSCRIPT_UNAVAILABLE ||
    code === ERROR_CODES.TRANSCRIPT_EMPTY ||
    code === ERROR_CODES.TRANSCRIPT_INCOMPLETE
  ) return 422;
  if (code === ERROR_CODES.LANGUAGE_UNAVAILABLE) return 422;
  return 500;
}