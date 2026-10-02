import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TranscriptCopyButton } from "@/components/transcript-copy-button";
import { formatTranscriptForCopy } from "@/lib/transcript-copy";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { isValidUuid, userOwnsRecord } from "@/lib/auth";

type TranscriptDetail = {
  id: string;
  job_id: string;
  user_id: string | null;
  video_id: string;
  source_url: string;
  title: string | null;
  language_code: string;
  language_name: string;
  provider: string;
  full_text: string | null;
  segment_count: number;
  created_at: string;
};

type TranscriptSegment = {
  sequence_number: number;
  text: string;
  start_ms: number | null;
  end_ms: number | null;
};

function formatTimestamp(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedSeconds = String(seconds).padStart(2, "0");

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`
    : `${minutes}:${paddedSeconds}`;
}

export default async function TranscriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  if (!isValidUuid(id)) {
    notFound();
  }

  const { data: transcriptData, error: transcriptError } = await supabase
    .from("transcripts")
    .select("id, job_id, user_id, video_id, source_url, title, language_code, language_name, provider, full_text, segment_count, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (transcriptError) {
    throw transcriptError;
  }

  const transcript = transcriptData as unknown as TranscriptDetail | null;
  if (!transcript || !userOwnsRecord(transcript.user_id, user.id)) {
    notFound();
  }

  const { data: segmentData, error: segmentsError } = await supabase
    .from("transcript_segments")
    .select("sequence_number, text, start_ms, end_ms")
    .eq("transcript_id", transcript.id)
    .order("sequence_number", { ascending: true });

  if (segmentsError) {
    throw segmentsError;
  }

  const segments = (segmentData ?? []) as unknown as TranscriptSegment[];

  return (
    <div className="auth-shell dashboard-shell">
      <div className="dashboard-header">
        <div>
          <p className="panel-kicker">Transcript</p>
          <h1>{transcript.title || transcript.video_id}</h1>
          {transcript.title ? <p>{transcript.video_id}</p> : null}
        </div>
        <div className="dashboard-actions">
          <Link href="/dashboard" className="secondary-link">Back to dashboard</Link>
          <Link href="/#workspace" className="secondary-link">New transcript</Link>
        </div>
      </div>

      <div className="dashboard-card">
        <dl className="transcript-details">
          <div><dt>Language</dt><dd>{transcript.language_name ?? transcript.language_code}</dd></div>
          <div><dt>Source</dt><dd><a href={transcript.source_url} target="_blank" rel="noreferrer">{transcript.source_url}</a></dd></div>
          <div><dt>Provider</dt><dd>{transcript.provider}</dd></div>
          <div><dt>Created</dt><dd>{new Date(transcript.created_at).toLocaleString()}</dd></div>
        </dl>
        <TranscriptCopyButton text={formatTranscriptForCopy(transcript.full_text, segments)} />
      </div>

      <div className="dashboard-card">
        <h2>Transcript</h2>
        <div className="transcript-viewer">
          {(segments.length > 0 ? segments : []).map((segment) => (
            <div key={`${transcript.id}-${segment.sequence_number}`} className="transcript-segment">
              {typeof segment.start_ms === "number" ? <span className="timestamp">{formatTimestamp(segment.start_ms)}</span> : null}
              <p>{segment.text}</p>
            </div>
          ))}
          {!transcript.full_text && segments.length === 0 ? <p className="empty-state">No transcript text is available yet.</p> : null}
          {transcript.full_text && segments.length === 0 ? <p>{transcript.full_text}</p> : null}
        </div>
      </div>
    </div>
  );
}
