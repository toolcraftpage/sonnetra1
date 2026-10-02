import { type ErrorCode } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import type { TranscriptProvider } from "@/lib/providers/transcript";
import { getRequestId } from "@/lib/request-id";
import type { RowFor } from "@/types/database";
import { createJobAccessToken, hashJobAccessToken } from "./job-access";
import { isRetryableErrorCode, JOB_RETRY_POLICY, retryDelayMs } from "./job-state";
import type { CompleteTranscriptInput, JobFailureInput, RepositoryContext, TranscriptJobRepository } from "./repositories/contracts";
import { SupabaseTranscriptJobRepository } from "./repositories/supabase";

export type JobDTO = {
  id: string;
  status: RowFor<"transcript_jobs">["status"];
  videoId: string | null;
  sourceUrl: string;
  provider: string;
  requestedLanguage: string | null;
  attemptCount: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  error?: { code: string; message: string };
};

export function toJobDto(row: RowFor<"transcript_jobs">): JobDTO {
  return {
    id: row.id, status: row.status, videoId: row.normalized_video_id, sourceUrl: row.source_url,
    provider: row.provider, requestedLanguage: row.requested_language_code, attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts, nextRetryAt: row.next_retry_at, createdAt: row.created_at,
    startedAt: row.started_at, completedAt: row.completed_at, failedAt: row.failed_at,
    ...(row.last_error_code ? { error: { code: row.last_error_code, message: row.last_error_message ?? "Transcript job failed." } } : {}),
  };
}

export class TranscriptJobService {
  private readonly jobs: TranscriptJobRepository;

  constructor(jobs: TranscriptJobRepository = new SupabaseTranscriptJobRepository()) {
    this.jobs = jobs;
  }

  async create(input: { videoId: string; sourceUrl: string; languageCode?: string; userId?: string | null }, requestId: string) {
    const access = createJobAccessToken();
    const now = new Date().toISOString();
    const row = await this.jobs.create({
      user_id: input.userId ?? null,
      access_token_hash: access.hash,
      source_url: input.sourceUrl,
      normalized_video_id: input.videoId,
      source_type: "youtube",
      requested_language_code: input.languageCode ?? null,
      requested_language_name: null,
      selected_language_code: null,
      selected_language_name: null,
      provider: "supadata",
      status: "queued",
      attempt_count: 0,
      max_attempts: JOB_RETRY_POLICY.maxAttempts,
      last_error_code: null,
      last_error_message: null,
      next_retry_at: null,
      started_at: null,
      completed_at: null,
      failed_at: null,
      created_at: now,
      updated_at: now,
    }, { userId: input.userId ?? null, requestId });
    return { job: toJobDto(row), accessToken: access.token };
  }

  async get(id: string, context: RepositoryContext) {
    const row = await this.jobs.getById(id, context);
    return row ? toJobDto(row) : null;
  }

  async getResult(id: string, context: RepositoryContext) {
    const job = await this.jobs.getById(id, context);
    if (!job || job.status !== "completed") return null;
    return this.jobs.getResult(id, context);
  }

  async complete(input: CompleteTranscriptInput, context: RepositoryContext) {
    return this.jobs.complete(input, context);
  }

  async fail(id: string, error: AppError, attemptCount: number, context: RepositoryContext) {
    const retry = (error.retryable || isRetryableErrorCode(error.code)) && attemptCount < JOB_RETRY_POLICY.maxAttempts;
    const failure: JobFailureInput = {
      status: retry ? "retrying" : "failed",
      errorCode: error.code,
      errorMessage: error.message,
      ...(retry ? { nextRetryAt: new Date(Date.now() + retryDelayMs(attemptCount)).toISOString() } : {}),
    };
    return this.jobs.fail(id, failure, context);
  }

  async retryFailed(id: string, context: RepositoryContext) {
    const job = await this.jobs.getById(id, context);
    if (!job) throw new AppError("NOT_FOUND", "Transcript job not found.");
    if (job.status !== "failed") throw new AppError("CONFLICT", "Only failed jobs may be retried.");
    if (!isRetryableErrorCode(job.last_error_code)) throw new AppError("CONFLICT", "This job is not eligible for retry.");
    const retryErrorCode = (job.last_error_code ?? "PROVIDER_ERROR") as ErrorCode;
    const retryError = new AppError(retryErrorCode, job.last_error_message ?? "The transcript job will be retried.", { statusCode: 503, retryable: true });
    const retryAt = new Date(Date.now() + retryDelayMs(job.attempt_count)).toISOString();
    return this.jobs.fail(id, {
      status: "retrying",
      errorCode: retryError.code,
      errorMessage: retryError.message,
      nextRetryAt: retryAt,
      attemptCount: 0,
    }, context);
  }
}

export class TranscriptJobWorker {
  private readonly jobs: TranscriptJobRepository;
  private readonly provider: TranscriptProvider;

  constructor(
    jobs: TranscriptJobRepository = new SupabaseTranscriptJobRepository(),
    provider: TranscriptProvider,
  ) {
    this.jobs = jobs;
    this.provider = provider;
  }

  async processJobById(jobId: string, requestId = getRequestId(new Request("http://localhost"))): Promise<string> {
    const service = new TranscriptJobService(this.jobs);
    const staleBefore = new Date(Date.now() - JOB_RETRY_POLICY.processingLeaseMs).toISOString();
    const job = await this.jobs.claimById(jobId, staleBefore, { userId: null, requestId });
    if (!job) {
      throw new AppError("NOT_FOUND", "Transcript job not found or is not eligible for processing.");
    }

    try {
      const result = await this.provider.retrieve({ videoId: job.normalized_video_id!, sourceUrl: job.source_url, languageCode: job.requested_language_code ?? undefined, requestId });
      const fullText = result.segments.map((segment) => segment.text).join("\n");
      await service.complete({ jobId: job.id, videoId: result.metadata.videoId, sourceUrl: result.metadata.canonicalUrl, provider: this.provider.id, providerReference: result.providerReference, languageCode: result.language.code, languageName: result.language.name, isAutoGenerated: result.language.isGenerated ?? false, fullText, segments: result.segments }, { userId: job.user_id, requestId });
      return job.id;
    } catch (caught) {
      const error = caught instanceof AppError ? caught : new AppError("PROVIDER_ERROR", "Transcript processing failed.", { retryable: true, cause: caught });
      await service.fail(job.id, error, job.attempt_count, {
        userId: job.user_id,
        requestId,
        ...(!job.user_id && job.access_token_hash ? { accessTokenHash: job.access_token_hash } : {}),
      });
      throw error;
    }
  }

  async run(requestId = getRequestId(new Request("http://localhost")), jobId?: string): Promise<number> {
    if (jobId) {
      await this.processJobById(jobId, requestId);
      return 1;
    }

    let processed = 0;
    const service = new TranscriptJobService(this.jobs);
    for (; processed < JOB_RETRY_POLICY.maxJobsPerRun; processed += 1) {
      const job = await this.jobs.claimNext(new Date(Date.now() - JOB_RETRY_POLICY.processingLeaseMs).toISOString(), { userId: null, requestId });
      if (!job) break;
      try {
        const result = await this.provider.retrieve({ videoId: job.normalized_video_id!, sourceUrl: job.source_url, languageCode: job.requested_language_code ?? undefined, requestId });
        const fullText = result.segments.map((segment) => segment.text).join("\n");
        await service.complete({ jobId: job.id, videoId: result.metadata.videoId, sourceUrl: result.metadata.canonicalUrl, provider: this.provider.id, providerReference: result.providerReference, languageCode: result.language.code, languageName: result.language.name, isAutoGenerated: result.language.isGenerated ?? false, fullText, segments: result.segments }, { userId: job.user_id, requestId });
      } catch (caught) {
        const error = caught instanceof AppError ? caught : new AppError("PROVIDER_ERROR", "Transcript processing failed.", { retryable: true, cause: caught });
        await service.fail(job.id, error, job.attempt_count, {
          userId: job.user_id,
          requestId,
          ...(!job.user_id && job.access_token_hash ? { accessTokenHash: job.access_token_hash } : {}),
        });
      }
    }
    return processed;
  }
}

export function contextForAnonymousToken(token: string | null, requestId: string): RepositoryContext {
  return { userId: null, requestId, ...(token ? { accessTokenHash: hashJobAccessToken(token) } : {}) };
}