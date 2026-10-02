-- Sonnetra initial relational schema.
-- This migration is intentionally data-free and does not connect to a project.
-- All timestamps are UTC timestamptz values. Transcript source and AI output are separate branches.

create extension if not exists pgcrypto;

create type public.transcript_job_status as enum (
  'queued',
  'processing',
  'completed',
  'failed',
  'retrying',
  'cancelled'
);

create type public.transcript_completeness_status as enum (
  'unknown',
  'validating',
  'complete',
  'incomplete',
  'unavailable'
);

create type public.ai_job_status as enum (
  'queued',
  'processing',
  'completed',
  'failed',
  'retrying',
  'cancelled'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'incomplete',
  'expired'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.transcript_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source_url text not null check (char_length(source_url) between 1 and 2048),
  normalized_video_id text check (normalized_video_id is null or char_length(normalized_video_id) between 1 and 32),
  source_type text not null default 'youtube' check (source_type = 'youtube'),
  requested_language_code text,
  requested_language_name text,
  selected_language_code text,
  selected_language_name text,
  provider text not null check (char_length(provider) between 1 and 100),
  status public.transcript_job_status not null default 'queued',
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 20),
  last_error_code text,
  last_error_message text,
  next_retry_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (completed_at is null or status = 'completed'),
  check (failed_at is null or status = 'failed'),
  check (next_retry_at is null or status = 'retrying')
);

create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.transcript_jobs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  video_id text not null check (char_length(video_id) between 1 and 32),
  source_url text not null check (char_length(source_url) between 1 and 2048),
  title text,
  language_code text not null check (char_length(language_code) between 1 and 32),
  language_name text not null check (char_length(language_name) between 1 and 128),
  is_auto_generated boolean not null default false,
  provider text not null check (char_length(provider) between 1 and 100),
  provider_reference text,
  source_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(source_metadata) = 'object'),
  full_text text,
  segment_count integer not null default 0 check (segment_count >= 0),
  duration_seconds numeric(12, 3) check (duration_seconds is null or duration_seconds >= 0),
  completeness_status public.transcript_completeness_status not null default 'unknown',
  completeness_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  transcript_id uuid not null references public.transcripts(id) on delete cascade,
  sequence_number integer not null check (sequence_number >= 0),
  start_ms bigint check (start_ms is null or start_ms >= 0),
  end_ms bigint check (end_ms is null or end_ms >= 0),
  text text not null check (char_length(text) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (transcript_id, sequence_number),
  check (end_ms is null or start_ms is null or end_ms >= start_ms)
);

create table public.transcript_languages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.transcript_jobs(id) on delete cascade,
  language_code text not null check (char_length(language_code) between 1 and 32),
  language_name text not null check (char_length(language_name) between 1 and 128),
  is_default boolean not null default false,
  is_auto_generated boolean not null default false,
  provider text not null check (char_length(provider) between 1 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  unique (job_id, language_code, provider)
);

create table public.saved_transcripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transcript_id uuid not null references public.transcripts(id) on delete cascade,
  label text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, transcript_id)
);

create table public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, name)
);

create table public.folder_items (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.folders(id) on delete cascade,
  saved_transcript_id uuid not null references public.saved_transcripts(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (folder_id, saved_transcript_id)
);

create table public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transcript_id uuid not null references public.transcripts(id) on delete cascade,
  operation text not null check (char_length(operation) between 1 and 80),
  status public.ai_job_status not null default 'queued',
  provider text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.ai_outputs (
  id uuid primary key default gen_random_uuid(),
  ai_job_id uuid not null references public.ai_jobs(id) on delete cascade,
  transcript_id uuid not null references public.transcripts(id) on delete cascade,
  operation text not null check (char_length(operation) between 1 and 80),
  language_code text,
  content text not null check (char_length(content) > 0),
  structured_content jsonb check (structured_content is null or jsonb_typeof(structured_content) in ('object', 'array')),
  model text,
  provider_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(provider_metadata) = 'object'),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (char_length(action) between 1 and 80),
  quantity integer not null default 1 check (quantity > 0),
  period_start date,
  period_end date,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  check (period_end is null or period_start is null or period_end >= period_start)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (char_length(provider) between 1 and 80),
  external_customer_id text,
  external_subscription_id text,
  status public.subscription_status not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider, external_subscription_id),
  check (current_period_end is null or current_period_start is null or current_period_end >= current_period_start)
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (char_length(plan) between 1 and 80),
  feature text not null check (char_length(feature) between 1 and 120),
  value jsonb not null default 'true'::jsonb,
  effective_from timestamptz not null default timezone('utc', now()),
  effective_until timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, plan, feature),
  check (effective_until is null or effective_until >= effective_from)
);

create index transcript_jobs_user_id_idx on public.transcript_jobs(user_id);
create index transcript_jobs_status_idx on public.transcript_jobs(status);
create index transcript_jobs_created_at_idx on public.transcript_jobs(created_at desc);
create index transcript_jobs_retry_idx on public.transcript_jobs(status, next_retry_at);
create index transcript_jobs_provider_idx on public.transcript_jobs(provider);
create index transcripts_user_id_idx on public.transcripts(user_id);
create index transcripts_video_id_idx on public.transcripts(video_id);
create index transcripts_created_at_idx on public.transcripts(created_at desc);
create index transcripts_language_code_idx on public.transcripts(language_code);
create index transcript_segments_transcript_id_idx on public.transcript_segments(transcript_id);
create index saved_transcripts_user_id_idx on public.saved_transcripts(user_id);
create index saved_transcripts_transcript_id_idx on public.saved_transcripts(transcript_id);
create index folders_user_id_idx on public.folders(user_id);
create index folder_items_folder_id_idx on public.folder_items(folder_id);
create index folder_items_saved_transcript_id_idx on public.folder_items(saved_transcript_id);
create index ai_jobs_user_id_idx on public.ai_jobs(user_id);
create index ai_jobs_transcript_id_idx on public.ai_jobs(transcript_id);
create index ai_jobs_status_idx on public.ai_jobs(status);
create index usage_records_user_id_created_at_idx on public.usage_records(user_id, created_at desc);
create index subscriptions_user_id_idx on public.subscriptions(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger transcript_jobs_set_updated_at before update on public.transcript_jobs for each row execute function public.set_updated_at();
create trigger transcripts_set_updated_at before update on public.transcripts for each row execute function public.set_updated_at();
create trigger saved_transcripts_set_updated_at before update on public.saved_transcripts for each row execute function public.set_updated_at();
create trigger folders_set_updated_at before update on public.folders for each row execute function public.set_updated_at();
create trigger ai_jobs_set_updated_at before update on public.ai_jobs for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger entitlements_set_updated_at before update on public.entitlements for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS is enabled on every user-owned table. Anonymous jobs may be created by a
-- trusted server path later, but have no browser policy until a secure session
-- ownership mechanism exists.
alter table public.profiles enable row level security;
alter table public.transcript_jobs enable row level security;
alter table public.transcripts enable row level security;
alter table public.transcript_segments enable row level security;
alter table public.transcript_languages enable row level security;
alter table public.saved_transcripts enable row level security;
alter table public.folders enable row level security;
alter table public.folder_items enable row level security;
alter table public.ai_jobs enable row level security;
alter table public.ai_outputs enable row level security;
alter table public.usage_records enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;

create policy profiles_select_own on public.profiles for select using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy transcript_jobs_select_own on public.transcript_jobs for select using (user_id = (select auth.uid()));
create policy transcript_jobs_insert_own on public.transcript_jobs for insert with check (user_id = (select auth.uid()));
create policy transcript_jobs_update_own on public.transcript_jobs for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy transcript_jobs_delete_own on public.transcript_jobs for delete using (user_id = (select auth.uid()));

create policy transcripts_select_own on public.transcripts for select using (user_id = (select auth.uid()));
create policy transcripts_insert_own on public.transcripts for insert with check (user_id = (select auth.uid()));
create policy transcripts_update_own on public.transcripts for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy transcripts_delete_own on public.transcripts for delete using (user_id = (select auth.uid()));

create policy transcript_segments_select_own on public.transcript_segments for select using (
  exists (select 1 from public.transcripts t where t.id = transcript_id and t.user_id = (select auth.uid()))
);
create policy transcript_segments_insert_own on public.transcript_segments for insert with check (
  exists (select 1 from public.transcripts t where t.id = transcript_id and t.user_id = (select auth.uid()))
);
create policy transcript_segments_delete_own on public.transcript_segments for delete using (
  exists (select 1 from public.transcripts t where t.id = transcript_id and t.user_id = (select auth.uid()))
);

create policy transcript_languages_select_own on public.transcript_languages for select using (
  exists (select 1 from public.transcript_jobs j where j.id = job_id and j.user_id = (select auth.uid()))
);

create policy saved_transcripts_select_own on public.saved_transcripts for select using (user_id = (select auth.uid()));
create policy saved_transcripts_insert_own on public.saved_transcripts for insert with check (
  user_id = (select auth.uid()) and exists (select 1 from public.transcripts t where t.id = transcript_id and t.user_id = (select auth.uid()))
);
create policy saved_transcripts_update_own on public.saved_transcripts for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy saved_transcripts_delete_own on public.saved_transcripts for delete using (user_id = (select auth.uid()));

create policy folders_select_own on public.folders for select using (user_id = (select auth.uid()));
create policy folders_insert_own on public.folders for insert with check (user_id = (select auth.uid()));
create policy folders_update_own on public.folders for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy folders_delete_own on public.folders for delete using (user_id = (select auth.uid()));

create policy folder_items_select_own on public.folder_items for select using (
  exists (select 1 from public.folders f where f.id = folder_id and f.user_id = (select auth.uid()))
);
create policy folder_items_insert_own on public.folder_items for insert with check (
  exists (select 1 from public.folders f where f.id = folder_id and f.user_id = (select auth.uid()))
  and exists (select 1 from public.saved_transcripts s where s.id = saved_transcript_id and s.user_id = (select auth.uid()))
);
create policy folder_items_delete_own on public.folder_items for delete using (
  exists (select 1 from public.folders f where f.id = folder_id and f.user_id = (select auth.uid()))
);

create policy ai_jobs_select_own on public.ai_jobs for select using (user_id = (select auth.uid()));
create policy ai_jobs_insert_own on public.ai_jobs for insert with check (
  user_id = (select auth.uid()) and exists (select 1 from public.transcripts t where t.id = transcript_id and t.user_id = (select auth.uid()))
);
create policy ai_jobs_delete_own on public.ai_jobs for delete using (user_id = (select auth.uid()));

create policy ai_outputs_select_own on public.ai_outputs for select using (
  exists (select 1 from public.ai_jobs j where j.id = ai_job_id and j.user_id = (select auth.uid()))
);

create policy usage_records_select_own on public.usage_records for select using (user_id = (select auth.uid()));
create policy subscriptions_select_own on public.subscriptions for select using (user_id = (select auth.uid()));
create policy entitlements_select_own on public.entitlements for select using (user_id = (select auth.uid()));

-- No browser insert/update policies exist for usage, subscriptions, or entitlements.
-- Those records are server-controlled and will require privileged service access.
