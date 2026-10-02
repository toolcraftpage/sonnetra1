create or replace function public.claim_transcript_job_by_id(
  p_job_id uuid,
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
    where id = p_job_id
      and (
        status = 'queued'
        or (status = 'retrying' and (next_retry_at is null or next_retry_at <= p_now))
        or (status = 'processing' and updated_at < p_stale_before)
      )
      and attempt_count < max_attempts
    for update
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

revoke all on function public.claim_transcript_job_by_id(uuid, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.claim_transcript_job_by_id(uuid, timestamptz, timestamptz) to service_role;
