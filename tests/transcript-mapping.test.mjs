import assert from "node:assert/strict";
import test from "node:test";
import { mapPersistedTranscript } from "../src/server/repositories/map-persisted-transcript.ts";

test("persisted transcript mapping preserves provider, Amharic metadata, source metadata, and ordered segments", () => {
  const result = mapPersistedTranscript({
    title: "Amharic source",
    video_id: "dQw4w9WgXcQ",
    source_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    full_text: "ሰላም ዓለም\nSecond segment",
    created_at: "2026-10-08T12:00:00.000Z",
    language_code: "am",
    language_name: "Amharic",
    is_auto_generated: true,
    provider: "supadata",
    provider_reference: "provider-ref-1",
    source_metadata: { channel: "Example source", flags: ["captions"] },
  }, [
    { sequence_number: 0, text: "ሰላም ዓለም", start_ms: 0, end_ms: 1_250 },
    { sequence_number: 1, text: "Second segment", start_ms: null, end_ms: null },
  ]);

  assert.equal(result.provider, "supadata");
  assert.equal(result.providerReference, "provider-ref-1");
  assert.deepEqual(result.sourceMetadata, { channel: "Example source", flags: ["captions"] });
  assert.deepEqual(result.language, { code: "am", name: "Amharic", isGenerated: true });
  assert.deepEqual(result.metadata, {
    videoId: "dQw4w9WgXcQ",
    canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Amharic source",
  });
  assert.equal(result.createdAt, "2026-10-08T12:00:00.000Z");
  assert.equal(result.fullText, "ሰላም ዓለም\nSecond segment");
  assert.deepEqual(result.segments, [
    { index: 0, text: "ሰላም ዓለም", startMs: 0, endMs: 1_250 },
    { index: 1, text: "Second segment" },
  ]);
});

test("persisted transcript mapping preserves false generated-language state and empty metadata", () => {
  const result = mapPersistedTranscript({
    title: null,
    video_id: "dQw4w9WgXcQ",
    source_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    full_text: "Hello",
    created_at: "2026-10-08T12:00:00.000Z",
    language_code: "en",
    language_name: "English",
    is_auto_generated: false,
    provider: "supadata",
    provider_reference: null,
    source_metadata: {},
  }, [{ sequence_number: 0, text: "Hello", start_ms: null, end_ms: null }]);

  assert.equal(result.language.isGenerated, false);
  assert.equal(result.providerReference, null);
  assert.deepEqual(result.sourceMetadata, {});
  assert.deepEqual(result.segments, [{ index: 0, text: "Hello" }]);
});