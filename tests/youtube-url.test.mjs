import assert from "node:assert/strict";
import test from "node:test";
import { ERROR_CODES } from "../src/lib/constants.ts";
import { canonicalYouTubeSourceUrl, parseYouTubeUrl } from "../src/lib/youtube-url.ts";

const id = "dQw4w9WgXcQ";

function valid(url, sourceType = "watch") {
  const result = parseYouTubeUrl(url);
  assert.equal(result.valid, true);
  assert.equal(result.videoId, id);
  assert.equal(result.sourceType, sourceType);
  assert.equal(result.canonicalUrl, `https://www.youtube.com/watch?v=${id}`);
  return result;
}

function invalid(url, code) {
  const result = parseYouTubeUrl(url);
  assert.equal(result.valid, false);
  assert.equal(result.code, code);
}

test("accepts all supported YouTube URL forms and preserves ID case", () => {
  valid(`https://youtube.com/watch?v=${id}`);
  valid(`https://www.youtube.com/watch?v=${id}`, "watch");
  valid(`http://www.youtube.com/watch?v=${id}`, "watch");
  valid(`https://youtu.be/${id}`, "short");
  valid(`https://www.youtube.com/shorts/${id}`, "shorts");
  valid(`https://www.youtube.com/embed/${id}`, "embed");
  valid(`https://www.youtube.com/live/${id}`, "live");
  valid(`  https://www.youtube.com/watch?v=${id}&list=playlist&index=2&t=42s&si=tracking&utm_source=test&unknown=x  `);
});

test("canonicalization ignores playback, playlist, tracking, and unknown parameters", () => {
  const result = valid(`https://www.youtube.com/watch?feature=shared&v=${id}&start=10&list=abc&utm_campaign=x`);
  assert.equal(result.originalUrl, `https://www.youtube.com/watch?feature=shared&v=${id}&start=10&list=abc&utm_campaign=x`);
});

test("provider source URLs are canonicalized and must match the stored video ID", () => {
  assert.equal(
    canonicalYouTubeSourceUrl(id, `https://youtu.be/${id}?t=42`),
    `https://www.youtube.com/watch?v=${id}`,
  );
  assert.throws(
    () => canonicalYouTubeSourceUrl("aaaaaaaaaaa", `https://youtu.be/${id}`),
    (error) => error.code === ERROR_CODES.PROVIDER_MALFORMED_RESPONSE,
  );
  assert.throws(
    () => canonicalYouTubeSourceUrl(id, "https://attacker.example/video"),
    (error) => error.code === ERROR_CODES.UNSUPPORTED_HOST,
  );
});

test("rejects malformed, incomplete, and unsupported inputs with typed failures", () => {
  invalid("", ERROR_CODES.INVALID_URL);
  invalid("random text", ERROR_CODES.INVALID_URL);
  invalid(`https://www.youtube.com/watch`, ERROR_CODES.MISSING_VIDEO_ID);
  invalid(`https://www.youtube.com/watch?v=`, ERROR_CODES.MISSING_VIDEO_ID);
  invalid("https://www.youtube.com/watch?v=short", ERROR_CODES.INVALID_VIDEO_ID);
  invalid(`https://www.youtube.com/watch?v=${id}x`, ERROR_CODES.INVALID_VIDEO_ID);
  invalid(`https://www.youtube.com/watch?v=${id} other`, ERROR_CODES.INVALID_VIDEO_ID);
  invalid(`https://www.youtube.com/watch?v=${id} https://youtu.be/${id}`, ERROR_CODES.MULTIPLE_URLS);
  invalid(`https://www.youtube.com/watch?v=${"a".repeat(2049)}`, ERROR_CODES.URL_TOO_LONG);
});

test("rejects protocol confusion, credentials, fragments, ports, and lookalike hosts", () => {
  invalid(`javascript://youtube.com/watch?v=${id}`, ERROR_CODES.UNSUPPORTED_PROTOCOL);
  invalid(`data://youtube.com/watch?v=${id}`, ERROR_CODES.UNSUPPORTED_PROTOCOL);
  invalid(`file://youtube.com/watch?v=${id}`, ERROR_CODES.UNSUPPORTED_PROTOCOL);
  invalid(`https://youtube.com@attacker.example/watch?v=${id}`, ERROR_CODES.UNSUPPORTED_HOST);
  invalid(`https://youtube.com.attacker.example/watch?v=${id}`, ERROR_CODES.UNSUPPORTED_HOST);
  invalid(`https://attacker.example/youtube.com/watch?v=${id}`, ERROR_CODES.UNSUPPORTED_HOST);
  invalid(`https://www.youtube.com:443/watch?v=${id}`, ERROR_CODES.UNSUPPORTED_URL);
  invalid(`https://www.youtube.com/watch?v=${id}#fragment`, ERROR_CODES.UNSUPPORTED_URL);
  invalid(`https://youtube.example.com/watch?v=${id}`, ERROR_CODES.UNSUPPORTED_HOST);
  invalid(`https://www.youtube.com/watch?v=${id}\n`, ERROR_CODES.INVALID_URL);
});

test("handles Unicode and arbitrary strings without throwing", () => {
  invalid("ሰላም ዓለም", ERROR_CODES.INVALID_URL);
  for (let index = 0; index < 100; index += 1) {
    const value = `${String.fromCodePoint(0x1200 + index)}-${index}-https://not-youtube.invalid`;
    assert.doesNotThrow(() => parseYouTubeUrl(value));
    assert.equal(parseYouTubeUrl(value).valid, false);
  }
});

test("valid canonical output is deterministic", () => {
  const input = `https://m.youtube.com/watch?v=${id}&utm_medium=email`;
  assert.deepEqual(parseYouTubeUrl(input), parseYouTubeUrl(input));
  assert.equal(parseYouTubeUrl(`https://www.youtube.com/watch?v=${id}`).videoId, id);
});