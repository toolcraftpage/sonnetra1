export type TranscriptCopySegment = { text: string };

export function formatTranscriptForCopy(
  fullText: string | null | undefined,
  segments: readonly TranscriptCopySegment[],
): string {
  if (typeof fullText === "string" && fullText.length > 0) {
    return fullText;
  }

  return segments.map((segment) => segment.text).join("\n");
}