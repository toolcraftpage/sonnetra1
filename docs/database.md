# Phase 5 durable jobs

The additive migration `20260928000100_durable_transcript_jobs.sql` adds an `access_token_hash` binding to `transcript_jobs` and a partial unique index. Phase 8B verified the remote project link, migrations, and a real read-only query. It also adds two server-only security-definer functions:

- `claim_next_transcript_job`: uses row locking and `skip locked` to claim one queued, retryable, or stale processing job.
- `complete_transcript_job`: inserts transcript metadata, language, and every ordered segment in one transaction, then marks the job completed. Existing `job_id` uniqueness makes repeated completion idempotent.

The worker uses the service-role Supabase boundary only. Browser RLS policies are unchanged and no unrestricted policies were added. Live job-to-transcript persistence has not yet been verified by a real provider-backed job because the Supadata key is missing.
# Sonnetra Database

The initial schema is defined in `supabase/migrations/20260927000100_initial_schema.sql`; the durable-job migration was applied to the verified Supabase project in Phase 8B. Never modify production tables manually; use reviewed migrations.

## Relationship model

```text
auth.users -> profiles
auth.users -> transcript_jobs -> transcripts -> transcript_segments
                         |          |
                         v          v
                  transcript_languages  saved_transcripts -> folder_items <- folders
                                           |
transcripts -> ai_jobs -> ai_outputs       |
auth.users -> usage_records, subscriptions, entitlements
```

## Tables

- `profiles`: one application profile per `auth.users` row. The trigger creates a profile for a real auth user; no fake users are seeded.
- `transcript_jobs`: asynchronous lifecycle, source URL, language selection, provider, retry counters, and safe error fields. It intentionally has no progress percentage.
- `transcripts`: immutable normalized source metadata and completeness state. `source_metadata` is limited provider metadata; AI content is never stored here.
- `transcript_segments`: ordered Unicode-safe text with integer millisecond timestamps and a unique `(transcript_id, sequence_number)` constraint.
- `transcript_languages`: languages discovered for a job, unique by job, language, and provider.
- `saved_transcripts`, `folders`, `folder_items`: user library and organization relationships.
- `ai_jobs`, `ai_outputs`: a separate derived-data branch from the original transcript.
- `usage_records`: append-oriented usage events, not fake balances or billing calculations.
- `subscriptions`, `entitlements`: future billing and feature access boundary without a payment-provider dependency.

All primary keys are UUIDs. User IDs reference `auth.users(id)`. Timestamps are UTC `timestamptz` values with database defaults and update triggers.

## Integrity and deletion

- Segment rows cascade when their transcript is deleted; folder items cascade when their folder or saved relationship is deleted.
- A transcript is tied to its job with `ON DELETE CASCADE`, so deleting a job removes its source tree intentionally. Application code should not delete completed jobs casually.
- User-owned rows cascade when the corresponding auth user is deleted to honor account deletion. Anonymous jobs have `user_id = NULL`; the server-issued random access token is bound by its persisted SHA-256 hash, and server status reads scope to that hash. No browser RLS policy grants direct access to anonymous jobs.
- Saved transcripts are unique per `(user_id, transcript_id)`; folders are unique per `(user_id, name)`; folder membership is unique per `(folder_id, saved_transcript_id)`.
- Check constraints reject negative attempts, sequence numbers, timestamps, durations, empty text, invalid status timing, and reversed date/time ranges.

## Completeness and immutability

`transcript_completeness_status` supports `unknown`, `validating`, `complete`, `incomplete`, and `unavailable`. Ingestion must validate segment existence, ordering, timing, and provider completion before setting `complete`. HTTP 200 alone is insufficient.

The source branch is:

```text
transcript_jobs -> transcripts -> transcript_segments
```

The AI branch is:

```text
transcripts -> ai_jobs -> ai_outputs
```

Summaries, translations, and rewrites never overwrite source text.

## RLS and ownership

RLS is enabled on every user-owned table. Policies use `auth.uid()` and trusted foreign-key relationships, never request-supplied ownership IDs. Segment, language, folder-item, and AI-output policies derive ownership from their parent rows. There are no browser policies for usage writes, subscription writes, or entitlement writes; those will be server-controlled.

Anonymous jobs can exist as rows with a null `user_id`, but no browser policy grants access to them. A future implementation must use a server-issued, expiring anonymous session binding rather than an arbitrary client ID.

## Indexes

Indexes cover job owner/status/retry/provider/time, transcript owner/video/language/time, segment transcript, saved transcript ownership, folder ownership/membership, AI owner/transcript/status, usage owner/time, and subscription owner. No speculative full-text or dozens of query indexes are included yet.

## Atomicity and access layer

Transcript metadata and ordered segments are persisted in one `complete_transcript_job` RPC transaction. The application worker calls this through the server repository. A real transcript-backed RPC execution and row-level verification remain pending the Phase 8C provider test.

## Types and migrations

`src/types/database.ts` is a hand-maintained interim contract explicitly matched to the migration. It is not presented as generated output. After linking a real project and applying migrations, generate official types with:

```bash
supabase gen types typescript --linked > src/types/database.generated.ts
```

Then replace the interim contract only after reviewing the generated schema. Apply future changes through timestamped migrations; never edit production tables manually. Local validation with `supabase db lint --local` requires Docker, which is unavailable in this environment.
