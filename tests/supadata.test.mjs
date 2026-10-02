import assert from "node:assert/strict";
import test from "node:test";
import { ERROR_CODES } from "../src/lib/constants.ts";
import { AppError } from "../src/lib/errors.ts";
import { normalizeSupadataResponse } from "../src/lib/providers/supadata-normalizer.ts";

const request = { videoId: "dQw4w9WgXcQ", sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" };

test("normalizes timestamped Unicode and Amharic chunks without rewriting text", () => {
  const result = normalizeSupadataResponse({
    lang: "am",
    availableLangs: ["am", "en"],
    content: [
      { text: "ሰላም ዓለም", offset: 0, duration: 1500, lang: "am" },
      { text: "Hello ሰላም world ዓለም", offset: 1500, duration: 2200, lang: "am" },
    ],
  }, request);
  assert.equal(result.language.code, "am");
  assert.equal(result.segments[0].text, "ሰላም ዓለም");
  assert.deepEqual(result.segments.map((segment) => [segment.index, segment.startMs, segment.endMs]), [[0, 0, 1500], [1, 1500, 3700]]);
});

test("preserves segments without timestamps", () => {
  const result = normalizeSupadataResponse({ lang: "en", content: [{ text: "Hello world", lang: "en" }] }, request);
  assert.equal(result.segments[0].startMs, undefined);
  assert.equal(result.segments[0].endMs, undefined);
});

test("rejects empty, malformed, out-of-order, negative, and inconsistent responses", () => {
  const incompleteCases = [
    { content: [{ text: "  ", offset: 0, duration: 1 }], lang: "en" },
    { content: [{ text: "x", offset: -1, duration: 1 }], lang: "en" },
    { content: [{ text: "x", offset: 2, duration: 1 }, { text: "y", offset: 1, duration: 1 }], lang: "en" },
    { content: [{ text: "x", offset: 0, duration: 1, lang: "am" }], lang: "en" },
    { content: [{ text: "x", offset: 0, duration: -1 }], lang: "en" },
  ];
  for (const response of incompleteCases) {
    assert.throws(() => normalizeSupadataResponse(response, request), (error) => error instanceof AppError && error.code === ERROR_CODES.PROVIDER_MALFORMED_RESPONSE);
  }
  assert.throws(() => normalizeSupadataResponse({ content: [], lang: "en" }, request), (error) => error instanceof AppError && error.code === ERROR_CODES.TRANSCRIPT_EMPTY);
});

test("rejects missing provider language and malformed content", () => {
  assert.throws(() => normalizeSupadataResponse({ content: [{ text: "x" }] }, request), (error) => error instanceof AppError && error.code === ERROR_CODES.PROVIDER_MALFORMED_RESPONSE);
  assert.throws(() => normalizeSupadataResponse({ lang: "en", content: "x" }, request), (error) => error instanceof AppError && error.code === ERROR_CODES.PROVIDER_MALFORMED_RESPONSE);
});

test("does not silently substitute a different requested language", () => {
  assert.throws(
    () => normalizeSupadataResponse({ lang: "en", content: [{ text: "Hello", lang: "en" }] }, { ...request, languageCode: "am" }),
    (error) => error instanceof AppError && error.code === ERROR_CODES.LANGUAGE_UNAVAILABLE,
  );
});