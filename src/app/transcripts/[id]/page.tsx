import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TranscriptReader } from "@/components/transcript-reader";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { isValidUuid, userOwnsRecord } from "@/lib/auth";
import { resolveJobAccessToken } from "@/server/job-access";
import { contextForAnonymousToken, TranscriptJobService } from "@/server/transcript-jobs";

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

export default async function TranscriptDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const requestId = `transcript-detail-${id}`;
  const token = resolveJobAccessToken(searchParams ? await searchParams : null);

  if (!isValidUuid(id)) {
    notFound();
  }

  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    if (!token) {
      redirect("/login");
    }

    const anonymousContext = contextForAnonymousToken(token, requestId);
    const job = await new TranscriptJobService().get(id, anonymousContext);
    if (!job) {
      notFound();
    }

    if (job.status !== "completed") {
      return (
        <div className="auth-shell dashboard-shell">
          <div className="dashboard-header">
            <div>
              <p className="panel-kicker">Transcript</p>
              <h1>Job status</h1>
            </div>
            <div className="dashboard-actions">
              <Link href="/#workspace" className="secondary-link">New transcript</Link>
            </div>
          </div>
          <div className="dashboard-card">
            <p>This transcript is still processing and is not ready for display yet.</p>
            <p className="panel-kicker">Current status: {job.status}</p>
          </div>
        </div>
      );
    }

    const transcript = await new TranscriptJobService().getResult(id, anonymousContext);
    if (!transcript) {
      notFound();
    }

    const segments = transcript.segments.map((segment) => ({
      sequence_number: segment.index,
      text: segment.text,
      start_ms: segment.startMs ?? null,
      end_ms: segment.endMs ?? null,
    })) as unknown as TranscriptSegment[];
    const transcriptRow = {
      id,
      job_id: id,
      user_id: null,
      video_id: transcript.metadata.videoId,
      source_url: transcript.metadata.canonicalUrl,
      title: null,
      language_code: transcript.language.code,
      language_name: transcript.language.name,
      provider: "supadata",
      full_text: transcript.segments.map((segment) => segment.text).join("\n"),
      segment_count: transcript.segments.length,
      created_at: new Date().toISOString(),
    } as unknown as TranscriptDetail;

    return (
      <div className="auth-shell dashboard-shell">
        <div className="dashboard-header">
          <div>
            <p className="panel-kicker">Transcript</p>
            <h1>{transcriptRow.title || transcriptRow.video_id}</h1>
          </div>
          <div className="dashboard-actions">
            <Link href="/#workspace" className="secondary-link">New transcript</Link>
          </div>
        </div>

        <div className="dashboard-card">
          <dl className="transcript-details">
            <div><dt>Language</dt><dd>{transcriptRow.language_name ?? transcriptRow.language_code}</dd></div>
            <div><dt>Source</dt><dd><a href={transcriptRow.source_url} target="_blank" rel="noreferrer">{transcriptRow.source_url}</a></dd></div>
            <div><dt>Provider</dt><dd>{transcriptRow.provider}</dd></div>
          </dl>
        </div>

        <div className="dashboard-card">
          <h2>Transcript</h2>
          <TranscriptReader transcript={transcriptRow} segments={segments} />
        </div>
      </div>
    );
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
      </div>

      <div className="dashboard-card">
        <h2>Transcript</h2>
        <TranscriptReader transcript={transcript} segments={segments} />
      </div>
    </div>
  );
}
