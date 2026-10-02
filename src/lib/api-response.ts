import { AppError, serializeError } from "./errors.ts";
import { REQUEST_ID_HEADER } from "./constants.ts";
import type { Pagination } from "../types/domain";

export function successResponse<T>(
  data: T,
  options: { requestId?: string; pagination?: Pagination } = {},
): Response {
  const response = Response.json({
    success: true,
    data,
    ...(options.requestId ? { requestId: options.requestId } : {}),
    ...(options.pagination ? { pagination: options.pagination } : {}),
  });
  if (options.requestId) response.headers.set(REQUEST_ID_HEADER, options.requestId);
  return response;
}

export function errorResponse(
  error: unknown,
  requestId: string,
): Response {
  const serialized = serializeError(error, requestId);
  const status = error instanceof AppError ? error.statusCode : 500;
  const response = Response.json(serialized, { status });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}