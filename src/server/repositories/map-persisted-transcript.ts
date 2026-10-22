import type { PersistedTranscript } from "./contracts";

type PersistedTranscriptRow = {
  title: string | null;
  video_id: string;
  source_url: string;
  full_text: string | null;
  created_at: string;
  language_code: string;
  language_name: string;
  is_auto_generated: boolean;
  provider: string;
  provider_reference: string | null;
  source_metadata: Record<string, unknown>;
};

type PersistedSegmentRow = {
  sequence_number: number;
  text: string;
  start_ms: number | null;
  end_ms: number | null;
};

export function mapPersistedTranscript(
  transcript: PersistedTranscriptRow,
  segments: readonly PersistedSegmentRow[],
): PersistedTranscript {
  return {
    provider: transcript.provider,
    providerReference: transcript.provider_reference,
    sourceMetadata: transcript.source_metadata,
    createdAt: transcript.created_at,
    fullText: transcript.full_text,
    language: {
      code: transcript.language_code,
      name: transcript.language_name,
      isGenerated: transcript.is_auto_generated,
    },
    metadata: {
      videoId: transcript.video_id,
      canonicalUrl: transcript.source_url,
      title: transcript.title,
    },
    segments: segments.map((segment) => ({
      index: segment.sequence_number,
      text: segment.text,
      ...(segment.start_ms === null ? {} : { startMs: segment.start_ms }),
      ...(segment.end_ms === null ? {} : { endMs: segment.end_ms }),
    })),
  };
}