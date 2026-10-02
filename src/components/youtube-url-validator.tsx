"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ValidationData = { videoId: string; canonicalUrl: string; sourceType: string };
type TranscriptData = {
  language: { code: string; name: string };
  metadata: { videoId: string; canonicalUrl: string };
  segments: readonly { index: number; text: string; startMs?: number; endMs?: number }[];
};
type JobData = {
  id: string;
  status: "queued" | "processing" | "retrying" | "completed" | "failed" | "cancelled";
  videoId: string | null;
  sourceUrl: string;
  error?: { message: string };
};

function timestamp(milliseconds?: number) {
  if (milliseconds === undefined) return "";
  const totalSeconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function statusLabel(status: JobData["status"]) {
  return status === "queued" ? "Queued" : status === "processing" ? "Processing transcript" : status === "retrying" ? "Retrying" : status === "completed" ? "Transcript ready" : status === "cancelled" ? "Cancelled" : "Transcript unavailable";
}

export function YouTubeUrlValidator() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("");
  const [data, setData] = useState<ValidationData | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pollRun = useRef(0);

  async function pollJob(id: string, token: string, run: number) {
    setLoading(true);
    for (let attempt = 0; attempt < 90; attempt += 1) {
      if (run !== pollRun.current) return;
      const response = await fetch(`/api/transcripts/${encodeURIComponent(id)}`, { headers: { "x-job-token": token } });
      const payload = await response.json() as { success: boolean; data?: { job: JobData; transcript?: TranscriptData }; error?: { message?: string } };
      if (run !== pollRun.current) return;
      if (!response.ok || !payload.success || !payload.data) {
        setError(payload.error?.message || "The job status could not be loaded.");
        return;
      }
      setJob(payload.data.job);
      if (payload.data.transcript) setTranscript(payload.data.transcript);
      if (["completed", "failed", "cancelled"].includes(payload.data.job.status)) {
        setLoading(false);
        if (payload.data.job.status !== "completed") setError(payload.data.job.error?.message || "Transcript retrieval did not complete.");
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 2_000));
    }
    if (run === pollRun.current) {
      setLoading(false);
      setError("Status polling paused. Refresh to check this job again.");
    }
  }

  useEffect(() => {
    const stored = window.localStorage.getItem("sonnetra-active-job");
    if (stored) {
      try {
        const saved = JSON.parse(stored) as { id: string; token: string };
        const run = ++pollRun.current;
        void pollJob(saved.id, saved.token, run);
      } catch {
        window.localStorage.removeItem("sonnetra-active-job");
      }
    }
    return () => { pollRun.current += 1; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const run = ++pollRun.current;
    setLoading(true);
    setError("");
    setData(null);
    setTranscript(null);
    try {
      const response = await fetch("/api/transcripts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, ...(language ? { language } : {}) }) });
      const payload = await response.json() as { success: boolean; data?: { job: JobData; accessToken: string }; error?: { message?: string } };
      if (!response.ok || !payload.success || !payload.data) {
        setError(payload.error?.message || "The transcript job could not be created.");
        return;
      }
      setData({ videoId: payload.data.job.videoId || "", canonicalUrl: payload.data.job.sourceUrl, sourceType: "youtube" });
      setJob(payload.data.job);
      window.localStorage.setItem("sonnetra-active-job", JSON.stringify({ id: payload.data.job.id, token: payload.data.accessToken }));
      await pollJob(payload.data.job.id, payload.data.accessToken, run);
    } catch {
      if (run === pollRun.current) setError("Transcript job creation is temporarily unavailable.");
    } finally {
      if (run === pollRun.current) setLoading(false);
    }
  }

  async function copyTranscript() {
    if (transcript) await navigator.clipboard.writeText(transcript.segments.map((segment) => segment.text).join("\n"));
  }

  function clearJob() {
    pollRun.current += 1;
    setTranscript(null);
    setData(null);
    setJob(null);
    setUrl("");
    window.localStorage.removeItem("sonnetra-active-job");
  }

  return (
    <div className="validator" aria-live="polite">
      <p className="panel-kicker">Transcript workspace</p>
      <h2>Bring a YouTube video into focus.</h2>
      <p className="validator-copy">Sonnetra validates the source, creates a durable job, and retrieves a real transcript through the configured provider.</p>
      <form onSubmit={submit}>
        <label htmlFor="youtube-url">YouTube URL</label>
        <div className="validator-controls">
          <input id="youtube-url" name="url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." autoComplete="url" required />
          <button type="submit" disabled={loading}>{loading ? "Working..." : "Get transcript"}</button>
        </div>
      </form>
      <div className="language-control">
        <label htmlFor="transcript-language">Language (optional)</label>
        <input id="transcript-language" value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="am" inputMode="text" />
      </div>
      {error && <p className="validator-error" role="alert">{error}</p>}
      {job && <p className="job-status" aria-live="polite">{statusLabel(job.status)}</p>}
      {data && <div className="validator-success"><strong>Source validated</strong><dl><div><dt>Video ID</dt><dd>{data.videoId}</dd></div><div><dt>Canonical URL</dt><dd>{data.canonicalUrl}</dd></div><div><dt>Source type</dt><dd>{data.sourceType}</dd></div></dl></div>}
      {transcript && <section className="transcript-viewer" aria-labelledby="transcript-title">
        <div className="transcript-heading"><div><p className="panel-kicker">Transcript available</p><h3 id="transcript-title">{transcript.language.code}</h3></div><button type="button" onClick={copyTranscript}>Copy all</button></div>
        <ol>{transcript.segments.map((segment) => <li key={segment.index}><span className="timestamp">{timestamp(segment.startMs)}</span><p>{segment.text}</p></li>)}</ol>
        <button className="secondary-action" type="button" onClick={clearJob}>New transcript</button>
      </section>}
    </div>
  );
}
