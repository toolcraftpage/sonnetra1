import type { RepositoryContext } from "./contracts";

export function queryForTranscriptJobContext(context: RepositoryContext): string {
  if (context.userId) return `user_id=eq.${encodeURIComponent(context.userId)}`;
  if (context.accessTokenHash) return `access_token_hash=eq.${encodeURIComponent(context.accessTokenHash)}`;
  return "id=eq.00000000-0000-0000-0000-000000000000";
}

export function transcriptJobByIdQuery(id: string, context: RepositoryContext): string {
  return `transcript_jobs?id=eq.${encodeURIComponent(id)}&${queryForTranscriptJobContext(context)}`;
}