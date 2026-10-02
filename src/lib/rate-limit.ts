import { ERROR_CODES } from "./constants.ts";
import { AppError } from "./errors.ts";

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds?: number;
};

export type RateLimiter = {
  check(key: string, limit: number, windowMs: number): Promise<RateLimitDecision>;
};

export class DevelopmentRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitDecision> {
    if (!Number.isFinite(limit) || limit < 0 || !Number.isInteger(limit)) {
      throw new RangeError("limit must be a non-negative integer");
    }
    if (!Number.isFinite(windowMs) || windowMs <= 0) {
      throw new RangeError("windowMs must be a positive finite number");
    }

    const now = Date.now();
    const current = this.buckets.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    bucket.count += 1;
    this.buckets.set(key, bucket);
    const allowed = bucket.count <= limit;
    const remaining = allowed ? Math.max(0, limit - bucket.count) : 0;
    const retryAfterSeconds = allowed
      ? undefined
      : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    return {
      allowed,
      limit,
      remaining,
      ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
    };
  }
}

export function assertAllowed(decision: RateLimitDecision): void {
  if (!decision.allowed) {
    throw new AppError(ERROR_CODES.RATE_LIMITED, "Too many requests. Try again later.", {
      statusCode: 429,
      retryable: true,
    });
  }
}