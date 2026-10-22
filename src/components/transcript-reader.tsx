"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { countMatches, getVisibleSegments } from "@/lib/transcript-search";
import { formatTranscriptForCopy } from "@/lib/transcript-copy";
import { buildTranscriptExport, formatTranscriptWithTimestamps, hasSegmentStartTimes, hasValidSubtitleTiming } from "@/lib/transcript-export";

type TranscriptRow = {
  id: string;
  video_id: string;
  source_url: string;
  title: string | null;
  language_code: string;
  language_name: string;
  is_auto_generated: boolean;
  provider: string;
  provider_reference: string | null;
  source_metadata: Record<string, unknown>;
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
  const [copiedFormat, setCopiedFormat] = useState<"text" | "timestamps" | null>(null);
  const [status, setStatus] = useState<{ message: string; kind: "success" | "error" } | null>(null);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const matchRefs = useRef<Array<HTMLDivElement | null>>([]);

  const transcriptText = formatTranscriptForCopy(transcript.full_text, segments);

  const visibleSegments = useMemo(() => getVisibleSegments(segments, query), [query, segments]);
  const matchCount = useMemo(() => countMatches(segments, query), [query, segments]);
  const timestampsAvailable = hasSegmentStartTimes(segments);
  const subtitleTimingAvailable = hasValidSubtitleTiming(segments);

  async function copyTranscript(withTimestamps = false) {
    try {
      const content = withTimestamps ? formatTranscriptWithTimestamps(segments) : transcriptText;
      if (content === null) {
        setStatus({ message: "Timestamped copy is unavailable because segment timing is missing or invalid.", kind: "error" });
        return;
      }
      await navigator.clipboard.writeText(content);
      const format = withTimestamps ? "timestamps" : "text";
      setCopiedFormat(format);
      setStatus({ message: withTimestamps ? "Copied transcript with timestamps." : "Copied transcript text.", kind: "success" });
      window.setTimeout(() => setCopiedFormat(null), 1_500);
    } catch {
      setStatus({ message: "Clipboard access failed. Select and copy the transcript text manually.", kind: "error" });
    }
  }

  function exportTranscript(format: "txt" | "srt" | "vtt" | "json") {
    const filename = `${transcript.video_id || "transcript"}.${format}`;
    const text = buildTranscriptExport(format, transcript, segments);
    if (text === null) {
      setStatus({ message: `${format.toUpperCase()} export is unavailable because segment timing is missing or invalid.`, kind: "error" });
      return;
    }
    const mimeType = format === "json" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8";

    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus({ message: `Exported ${format.toUpperCase()} transcript.`, kind: "success" });
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
          <button type="button" className="secondary-action" onClick={() => copyTranscript()}>
            {copiedFormat === "text" ? "Copied" : "Copy transcript"}
          </button>
          <button type="button" className="secondary-action" onClick={() => copyTranscript(true)} disabled={!timestampsAvailable}>
            {copiedFormat === "timestamps" ? "Copied with timestamps" : "Copy with timestamps"}
          </button>
          <details className="export-menu">
            <summary className="secondary-action" aria-label="Export transcript">Export</summary>
            <div className="export-menu-items">
              <button type="button" onClick={() => exportTranscript("txt")}>TXT</button>
              <button type="button" onClick={() => exportTranscript("srt")} disabled={!subtitleTimingAvailable}>SRT</button>
              <button type="button" onClick={() => exportTranscript("vtt")} disabled={!subtitleTimingAvailable}>VTT</button>
              <button type="button" onClick={() => exportTranscript("json")}>JSON</button>
            </div>
          </details>
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

      {status ? <p className={`form-message ${status.kind}`} role={status.kind === "error" ? "alert" : "status"}>{status.message}</p> : null}

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
