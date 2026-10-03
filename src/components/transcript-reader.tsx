"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { countMatches, getVisibleSegments } from "@/lib/transcript-search";

type TranscriptRow = {
  id: string;
  video_id: string;
  source_url: string;
  title: string | null;
  language_code: string;
  language_name: string;
  provider: string;
  full_text: string | null;
  created_at: string;
};

type TranscriptSegment = {
  sequence_number: number;
  text: string;
  start_ms: number | null;
  end_ms: number | null;
};

type TranscriptReaderProps = {
  transcript: TranscriptRow;
  segments: TranscriptSegment[];
};

function formatTimestamp(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function buildPlainText(segments: TranscriptSegment[]): string {
  return segments.map((segment) => segment.text).join("\n");
}

function buildSrt(segments: TranscriptSegment[]): string {
  return segments
    .map((segment, index) => {
      const start = segment.start_ms ?? 0;
      const end = segment.end_ms ?? start;
      return `${index + 1}\n${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(end)}\n${segment.text}\n`;
    })
    .join("\n");
}

function formatSrtTimestamp(milliseconds: number): string {
  const totalMs = Math.max(0, milliseconds);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1_000);
  const ms = totalMs % 1_000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function buildVtt(segments: TranscriptSegment[]): string {
  return ["WEBVTT", "", ...segments.map((segment, index) => {
    const start = segment.start_ms ?? 0;
    const end = segment.end_ms ?? start;
    return `${index + 1}\n${formatVttTimestamp(start)} --> ${formatVttTimestamp(end)}\n${segment.text}\n`;
  })].join("\n");
}

function formatVttTimestamp(milliseconds: number): string {
  return formatSrtTimestamp(milliseconds).replace(",", ".");
}

function buildJson(segments: TranscriptSegment[], transcript: TranscriptRow): string {
  return JSON.stringify({
    id: transcript.id,
    videoId: transcript.video_id,
    sourceUrl: transcript.source_url,
    language: transcript.language_name ?? transcript.language_code,
    provider: transcript.provider,
    createdAt: transcript.created_at,
    segments: segments.map((segment) => ({
      index: segment.sequence_number,
      startMs: segment.start_ms,
      endMs: segment.end_ms,
      text: segment.text,
    })),
  }, null, 2);
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const escaped = escapeForRegex(query);
  const pattern = new RegExp(`(${escaped})`, "ig");
  const parts = text.split(pattern);
  return parts.map((part, index) =>
    part && part.toLowerCase() === query.toLowerCase()
      ? <mark key={`${part}-${index}`}>{part}</mark>
      : <span key={`${part}-${index}`}>{part}</span>,
  );
}

export function TranscriptReader({ transcript, segments }: TranscriptReaderProps) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const matchRefs = useRef<Array<HTMLDivElement | null>>([]);

  const transcriptText = transcript.full_text ?? buildPlainText(segments);

  const visibleSegments = useMemo(() => getVisibleSegments(segments, query), [query, segments]);
  const matchCount = useMemo(() => countMatches(segments, query), [query, segments]);

  async function copyTranscript() {
    try {
      await navigator.clipboard.writeText(transcriptText);
      setCopied(true);
      setStatus("Copied to clipboard.");
      window.setTimeout(() => setCopied(false), 1_500);
    } catch {
      setStatus("Clipboard access failed. Select and copy the transcript text manually.");
    }
  }

  function exportTranscript(format: "txt" | "srt" | "vtt" | "json") {
    const mimeType = format === "json" ? "application/json" : "text/plain;charset=utf-8";
    const filename = `${transcript.video_id || "transcript"}.${format}`;
    const text = format === "txt"
      ? transcriptText
      : format === "srt"
        ? buildSrt(segments)
        : format === "vtt"
          ? buildVtt(segments)
          : buildJson(segments, transcript);

    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(`Exported ${format.toUpperCase()} transcript.`);
  }

  function jumpToMatch(index: number) {
    const nextIndex = Math.max(0, Math.min(index, Math.max(visibleSegments.length - 1, 0)));
    setActiveMatchIndex(nextIndex);
    const node = matchRefs.current[nextIndex];
    node?.scrollIntoView({ block: "center", behavior: "smooth" });
    node?.focus();
  }

  function moveToMatch(direction: 1 | -1) {
    if (!query.trim() || visibleSegments.length === 0) return;
    const next = (activeMatchIndex + direction + visibleSegments.length) % visibleSegments.length;
    setActiveMatchIndex(next);
    jumpToMatch(next);
  }

  return (
    <div className="transcript-reader-shell">
      <div className="transcript-toolbar">
        <div className="search-box">
          <label htmlFor="transcript-search">Search transcript</label>
          <input
            id="transcript-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transcript text…"
            aria-label="Search transcript text"
          />
        </div>
        <div className="viewer-actions">
          <button type="button" className="secondary-action" onClick={copyTranscript}>
            {copied ? "Copied" : "Copy transcript"}
          </button>
          <div className="export-menu" aria-label="Export transcript">
            <button type="button" className="secondary-action">Export</button>
            <div className="export-menu-items">
              <button type="button" onClick={() => exportTranscript("txt")}>TXT</button>
              <button type="button" onClick={() => exportTranscript("srt")}>SRT</button>
              <button type="button" onClick={() => exportTranscript("vtt")}>VTT</button>
              <button type="button" onClick={() => exportTranscript("json")}>JSON</button>
            </div>
          </div>
        </div>
      </div>

      {query.trim() ? (
        <div className="search-summary">
          <span>{matchCount} match{matchCount === 1 ? "" : "es"}</span>
          <div className="search-actions">
            <button type="button" className="link-button" onClick={() => moveToMatch(-1)} aria-label="Previous search result">
              Previous
            </button>
            <button type="button" className="link-button" onClick={() => moveToMatch(1)} aria-label="Next search result">
              Next
            </button>
            <button type="button" className="link-button" onClick={() => jumpToMatch(0)}>
              First result
            </button>
          </div>
        </div>
      ) : null}

      {status ? <p className="form-message success" role="status">{status}</p> : null}

      <div className="transcript-viewer">
        {visibleSegments.length > 0 ? (
          visibleSegments.map((segment, index) => (
            <div
              key={`${transcript.id}-${segment.sequence_number}`}
              className="transcript-segment"
              ref={(node) => {
                matchRefs.current[index] = node;
              }}
              tabIndex={query.trim() ? 0 : -1}
            >
              {typeof segment.start_ms === "number" ? <span className="timestamp">{formatTimestamp(segment.start_ms)}</span> : null}
              <p>{highlightMatch(segment.text, query)}</p>
            </div>
          ))
        ) : (
          <p className="empty-state">No transcript sections match your current search.</p>
        )}

        {!transcript.full_text && segments.length === 0 ? (
          <p className="empty-state">No transcript text is available yet.</p>
        ) : null}
      </div>
    </div>
  );
}
