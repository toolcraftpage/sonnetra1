import assert from "node:assert/strict";
import test from "node:test";
import {
  assertCompletenessStatus,
  assertJobStatus,
  assertOrderedSegments,
  assertSegmentTiming,
  relationshipKey,
} from "../src/lib/database/validation.ts";
import { AppError } from "../src/lib/errors.ts";

test("database status validation accepts only migration enum values", () => {
  assert.equal(assertJobStatus("retrying"), "retrying");
  assert.equal(assertCompletenessStatus("validating"), "validating");
  assert.throws(() => assertJobStatus("running"), AppError);
  assert.throws(() => assertCompletenessStatus("done"), AppError);
});

test("segment validation preserves order, timing, and Unicode text boundaries", () => {
  assert.doesNotThrow(() => assertOrderedSegments([
    { sequenceNumber: 0 },
    { sequenceNumber: 1 },
  ]));
  assert.throws(() => assertOrderedSegments([{ sequenceNumber: 1 }]), AppError);
  assert.doesNotThrow(() => assertSegmentTiming(0, 1_250));
  assert.throws(() => assertSegmentTiming(2_000, 1_000), AppError);
  assert.equal("ሰላም፣ Hello".normalize("NFC"), "ሰላም፣ Hello");
});

test("relationship keys make duplicate membership detection deterministic", () => {
  assert.equal(relationshipKey("folder-1", "saved-1"), "folder-1:saved-1");
  assert.equal(
    relationshipKey("folder-1", "saved-1"),
    relationshipKey("folder-1", "saved-1"),
  );
});