// Hand-maintained contract matching supabase/migrations/20260927000100_initial_schema.sql.
// Replace with Supabase CLI generated types after a project is linked and schema is applied.

export type TranscriptJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "retrying"
  | "cancelled";

export type TranscriptCompletenessStatus =
  | "unknown"
  | "validating"
  | "complete"
  | "incomplete"
  | "unavailable";

export type AiJobStatus = TranscriptJobStatus;
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "incomplete"
  | "expired";

type Timestamp = string;
type Json = boolean | number | string | null | { [key: string]: Json } | Json[];

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type TranscriptJobRow = {
  id: string;
  user_id: string | null;
  access_token_hash: string | null;
  source_url: string;
  normalized_video_id: string | null;
  source_type: "youtube";
  requested_language_code: string | null;
  requested_language_name: string | null;
  selected_language_code: string | null;
  selected_language_name: string | null;
  provider: string;
  status: TranscriptJobStatus;
  attempt_count: number;
  max_attempts: number;
  last_error_code: string | null;
  last_error_message: string | null;
  next_retry_at: Timestamp | null;
  started_at: Timestamp | null;
  completed_at: Timestamp | null;
  failed_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type TranscriptRow = {
  id: string;
  job_id: string;
  user_id: string | null;
  video_id: string;
  source_url: string;
  title: string | null;
  language_code: string;
  language_name: string;
  is_auto_generated: boolean;
  provider: string;
  provider_reference: string | null;
  source_metadata: Record<string, Json>;
  full_text: string | null;
  segment_count: number;
  duration_seconds: number | null;
  completeness_status: TranscriptCompletenessStatus;
  completeness_error: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type TranscriptSegmentRow = {
  id: string;
  transcript_id: string;
  sequence_number: number;
  start_ms: number | null;
  end_ms: number | null;
  text: string;
  created_at: Timestamp;
};

type TranscriptLanguageRow = {
  id: string;
  job_id: string;
  language_code: string;
  language_name: string;
  is_default: boolean;
  is_auto_generated: boolean;
  provider: string;
  created_at: Timestamp;
};

type SavedTranscriptRow = {
  id: string;
  user_id: string;
  transcript_id: string;
  label: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type FolderRow = {
  id: string;
  user_id: string;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type FolderItemRow = {
  id: string;
  folder_id: string;
  saved_transcript_id: string;
  created_at: Timestamp;
};

type AiJobRow = {
  id: string;
  user_id: string;
  transcript_id: string;
  operation: string;
  status: AiJobStatus;
  provider: string | null;
  attempt_count: number;
  error_code: string | null;
  error_message: string | null;
  started_at: Timestamp | null;
  completed_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type AiOutputRow = {
  id: string;
  ai_job_id: string;
  transcript_id: string;
  operation: string;
  language_code: string | null;
  content: string;
  structured_content: Json | null;
  model: string | null;
  provider_metadata: Record<string, Json>;
  created_at: Timestamp;
};

type UsageRecordRow = {
  id: string;
  user_id: string;
  action: string;
  quantity: number;
  period_start: string | null;
  period_end: string | null;
  metadata: Record<string, Json>;
  created_at: Timestamp;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  provider: string;
  external_customer_id: string | null;
  external_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_start: Timestamp | null;
  current_period_end: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type EntitlementRow = {
  id: string;
  user_id: string;
  plan: string;
  feature: string;
  value: Json;
  effective_from: Timestamp;
  effective_until: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type Insert<T> = Partial<T>;
type Update<T> = Partial<T>;

type Table<Row> = {
  Row: Row;
  Insert: Insert<Row>;
  Update: Update<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      transcript_jobs: Table<TranscriptJobRow>;
      transcripts: Table<TranscriptRow>;
      transcript_segments: Table<TranscriptSegmentRow>;
      transcript_languages: Table<TranscriptLanguageRow>;
      saved_transcripts: Table<SavedTranscriptRow>;
      folders: Table<FolderRow>;
      folder_items: Table<FolderItemRow>;
      ai_jobs: Table<AiJobRow>;
      ai_outputs: Table<AiOutputRow>;
      usage_records: Table<UsageRecordRow>;
      subscriptions: Table<SubscriptionRow>;
      entitlements: Table<EntitlementRow>;
    };
    Enums: {
      transcript_job_status: TranscriptJobStatus;
      transcript_completeness_status: TranscriptCompletenessStatus;
      ai_job_status: AiJobStatus;
      subscription_status: SubscriptionStatus;
    };
  };
};

export type TableName = keyof Database["public"]["Tables"];
export type RowFor<T extends TableName> = Database["public"]["Tables"][T]["Row"];
