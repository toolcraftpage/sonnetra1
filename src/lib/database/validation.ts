import { AppError } from "../errors.ts";
import { ERROR_CODES } from "../constants.ts";
import type { TranscriptCompletenessStatus, TranscriptJobStatus } from "../../types/database.ts";

const jobStatuses = new Set<TranscriptJobStatus>([
  "queued",
  "processing",
  "completed",
  "failed",
  "retrying",
  "cancelled",
]);

const completenessStatuses = new Set<TranscriptCompletenessStatus>([
  "unknown",
  "validating",
  "complete",
  "incomplete",
  "unavailable",
]);

export function assertJobStatus(value: string): TranscriptJobStatus {
  if (!jobStatuses.has(value as TranscriptJobStatus)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Job status is invalid.");
  }
  return value as TranscriptJobStatus;
}

export function assertCompletenessStatus(value: string): TranscriptCompletenessStatus {
  if (!completenessStatuses.has(value as TranscriptCompletenessStatus)) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "Transcript completeness status is invalid.",
    );
  }
  return value as TranscriptCompletenessStatus;
}

export function assertSegmentTiming(startMs: number | null, endMs: number | null): void {
  if (
    (startMs !== null && (!Number.isInteger(startMs) || startMs < 0)) ||
    (endMs !== null && (!Number.isInteger(endMs) || endMs < 0)) ||
    (startMs !== null && endMs !== null && endMs < startMs)
  ) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Transcript segment timing is invalid.");
  }
}

export function assertOrderedSegments(
  segments: readonly { sequenceNumber: number }[],
): void {
  segments.forEach((segment, index) => {
    if (segment.sequenceNumber !== index) {
      throw new AppError(
        ERROR_CODES.TRANSCRIPT_INCOMPLETE,
        "Transcript segment ordering is incomplete.",
      );
    }
  });
}

export function relationshipKey(leftId: string, rightId: string): string {
  return `${leftId}:${rightId}`;
}
