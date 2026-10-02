import { ERROR_CODES } from "../lib/constants.ts";
import type { TranscriptJobStatus } from "../types/database.ts";

const transitions: Record<TranscriptJobStatus, readonly TranscriptJobStatus[]> = {
  queued: ["processing", "cancelled"],
  processing: ["completed", "retrying", "failed"],
  retrying: ["processing", "cancelled"],
  completed: [],
  failed: ["retrying"],
  cancelled: [],
};

export function canTransition(from: TranscriptJobStatus, to: TranscriptJobStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: TranscriptJobStatus, to: TranscriptJobStatus): void {
  if (!canTransition(from, to)) throw new Error(`Invalid transcript job transition: ${from} -> ${to}`);
}

export function isRetryableErrorCode(code: string | null | undefined): boolean {
  if (!code) return false;
  const retryableErrorCodes = new Set<string>([
    ERROR_CODES.PROVIDER_TIMEOUT,
    ERROR_CODES.PROVIDER_ERROR,
    ERROR_CODES.RATE_LIMITED,
    ERROR_CODES.INTERNAL_ERROR,
  ]);
  return retryableErrorCodes.has(code);
}

export const JOB_RETRY_POLICY = {
  maxAttempts: 3,
  baseDelayMs: 5_000,
  maxDelayMs: 5 * 60_000,
  processingLeaseMs: 10 * 60_000,
  maxJobsPerRun: 3,
} as const;

export function retryDelayMs(attempt: number): number {
  const exponential = Math.min(JOB_RETRY_POLICY.maxDelayMs, JOB_RETRY_POLICY.baseDelayMs * 2 ** Math.max(0, attempt - 1));
  return Math.floor(exponential * (0.8 + Math.random() * 0.4));
}