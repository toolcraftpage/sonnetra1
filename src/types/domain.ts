import type { JobState, PlanId } from "@/lib/constants";

export type TranscriptProviderId = "supadata" | "youtube-native" | string;

export type TranscriptSegment = {
  index: number;
  text: string;
  startMs?: number;
  endMs?: number;
};

export type TranscriptLanguage = {
  code: string;
  name: string;
  isGenerated?: boolean;
};

export type TranscriptMetadata = {
  videoId: string;
  canonicalUrl: string;
  title?: string;
  channelName?: string;
  thumbnailUrl?: string;
  durationMs?: number;
};

export type TranscriptSource = {
  provider: TranscriptProviderId;
  providerReference?: string;
  fetchedAt: string;
  language: TranscriptLanguage;
  metadata: TranscriptMetadata;
  segments: readonly TranscriptSegment[];
};

export type TranscriptJob = {
  id: string;
  status: JobState;
  createdAt: string;
  updatedAt: string;
  attemptCount: number;
  lastErrorCode?: string;
};

export type AiOutput = {
  id: string;
  sourceTranscriptId: string;
  operation: string;
  content: string;
  generatedAt: string;
  model?: string;
};

export type UsageLimit = {
  operation: string;
  limit: number;
  used: number;
  period: string;
};

export type Entitlement = {
  plan: PlanId;
  feature: string;
  enabled: boolean;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total?: number;
  hasMore?: boolean;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  requestId?: string;
  pagination?: Pagination;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    requestId: string;
    retryable?: boolean;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;