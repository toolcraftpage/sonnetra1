export type TranscriptSearchSegment = {
  text: string;
};

export function countMatches<T extends TranscriptSearchSegment>(segments: readonly T[], query: string): number {
  const needle = query.trim();
  if (!needle) return 0;
  const normalized = needle.toLocaleLowerCase();
  return segments.reduce((count, segment) => count + (segment.text.toLocaleLowerCase().includes(normalized) ? 1 : 0), 0);
}

export function getVisibleSegments<T extends TranscriptSearchSegment>(segments: readonly T[], query: string): T[] {
  const needle = query.trim();
  if (!needle) return [...segments];
  const normalized = needle.toLocaleLowerCase();
  return segments.filter((segment) => segment.text.toLocaleLowerCase().includes(normalized));
}
