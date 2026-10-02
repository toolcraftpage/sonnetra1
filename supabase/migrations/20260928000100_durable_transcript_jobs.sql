-- Additive Phase 5 job safety: anonymous access binding and transactional worker operations.
alter table public.transcript_jobs
  add column if not exists access_token_hash text;

create unique index if not exists transcript_jobs_access_token_hash_idx
  on public.transcript_jobs(access_token_hash)
  where access_token_hash is not null;

create or replace function public.claim_next_transcript_job(
  p_stale_before timestamptz,
  p_now timestamptz default timezone('utc', now())
)
returns setof public.transcript_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidate as (
    select id
    from public.transcript_jobs
    where (status = 'queued' or (status = 'retrying' and (next_retry_at is null or next_retry_at <= p_now))
      or (status = 'processing' and updated_at < p_stale_before))
      and attempt_count < max_attempts
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.transcript_jobs job
  set status = 'processing',
      attempt_count = job.attempt_count + 1,
      started_at = p_now,
      next_retry_at = null,
      last_error_code = case when job.status = 'processing' then 'STALE_JOB_RECOVERED' else null end,
      last_error_message = case when job.status = 'processing' then 'Recovered after a stale worker lease.' else null end,
      updated_at = p_now
  from candidate
  where job.id = candidate.id
  returning job.*;
end;
$$;

create or replace function public.complete_transcript_job(
  p_job_id uuid,
  p_video_id text,
  p_source_url text,
  p_provider text,
  p_provider_reference text,
  p_language_code text,
  p_language_name text,
  p_is_auto_generated boolean,
  p_full_text text,
  p_segments jsonb,
  p_completed_at timestamptz default timezone('utc', now())
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  transcript_id uuid;
  segment_count integer;
begin
  if jsonb_typeof(p_segments) <> 'array' or jsonb_array_length(p_segments) = 0 then
    raise exception using errcode = '22023', message = 'Transcript segments are incomplete';
  end if;

  select id into transcript_id from public.transcripts where job_id = p_job_id for update;
  if transcript_id is null then
    insert into public.transcripts (
      job_id, user_id, video_id, source_url, language_code, language_name,
      is_auto_generated, provider, provider_reference, full_text,
      segment_count, completeness_status
    )
    select j.id, j.user_id, p_video_id, p_source_url, p_language_code, p_language_name,
      p_is_auto_generated, p_provider, p_provider_reference, p_full_text,
      jsonb_array_length(p_segments), 'complete'
    from public.transcript_jobs j
    where j.id = p_job_id and j.status = 'processing'
    returning id into transcript_id;

    if transcript_id is null then
      raise exception using errcode = '22023', message = 'Job is not processing';
    end if;

    insert into public.transcript_languages (job_id, language_code, language_name, is_default, is_auto_generated, provider)
    values (p_job_id, p_language_code, p_language_name, true, p_is_auto_generated, p_provider)
    on conflict (job_id, language_code, provider) do update set language_name = excluded.language_name;

    insert into public.transcript_segments (transcript_id, sequence_number, start_ms, end_ms, text)
    select transcript_id, segment.sequence_number, segment.start_ms, segment.end_ms, segment.text
    from jsonb_to_recordset(p_segments) as segment(sequence_number integer, start_ms bigint, end_ms bigint, text text);
  end if;

  select count(*) into segment_count from public.transcript_segments where transcript_id = complete_transcript_job.transcript_id;
  if segment_count <> jsonb_array_length(p_segments) then
    raise exception using errcode = '22023', message = 'Transcript segment persistence is incomplete';
  end if;

  update public.transcript_jobs
  set status = 'completed', completed_at = p_completed_at, updated_at = p_completed_at,
      selected_language_code = p_language_code, selected_language_name = p_language_name,
      last_error_code = null, last_error_message = null
  where id = p_job_id;
  return transcript_id;
end;
$$;

revoke all on function public.claim_next_transcript_job(timestamptz, timestamptz) from public;
revoke all on function public.complete_transcript_job(uuid, text, text, text, text, text, text, boolean, text, jsonb, timestamptz) from public;