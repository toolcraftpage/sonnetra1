import { ERROR_CODES } from "./constants.ts";
import { AppError } from "./errors.ts";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export function normalizeAuthEmail(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().normalize("NFC").toLowerCase();
}

export function validatePassword(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (trimmed.length < 8 || trimmed.length > 128) {
    return false;
  }

  return /[A-Za-z]/u.test(trimmed) && /\d/u.test(trimmed);
}

export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

export function userOwnsRecord(
  recordUserId: string | null | undefined,
  sessionUserId: string | null | undefined,
): boolean {
  return Boolean(recordUserId && sessionUserId && recordUserId === sessionUserId);
}

export function assertUserOwnsRecord(
  recordUserId: string | null | undefined,
  sessionUserId: string | null | undefined,
  message = "This record is not available to the authenticated user.",
): void {
  if (!userOwnsRecord(recordUserId, sessionUserId)) {
    throw new AppError(ERROR_CODES.AUTHORIZATION_ERROR, message);
  }
}
