import {
  MAX_REQUEST_ID_LENGTH,
  REQUEST_ID_HEADER,
} from "./constants.ts";

const requestIdPattern = /^[A-Za-z0-9._:-]+$/;

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function getRequestId(request: Request): string {
  const incoming = request.headers.get(REQUEST_ID_HEADER)?.trim();
  if (
    incoming &&
    incoming.length <= MAX_REQUEST_ID_LENGTH &&
    requestIdPattern.test(incoming)
  ) {
    return incoming;
  }

  return createRequestId();
}

export function withRequestId(response: Response, requestId: string): Response {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}