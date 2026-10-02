revoke all on function public.claim_next_transcript_job(timestamptz, timestamptz)
  from public, anon, authenticated;
revoke all on function public.complete_transcript_job(uuid, text, text, text, text, text, text, boolean, text, jsonb, timestamptz)
  from public, anon, authenticated;

grant execute on function public.claim_next_transcript_job(timestamptz, timestamptz)
  to service_role;
grant execute on function public.complete_transcript_job(uuid, text, text, text, text, text, text, boolean, text, jsonb, timestamptz)
  to service_role;