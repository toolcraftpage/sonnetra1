import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../src/lib/errors.ts";
import { normalizeAuthEmail, validatePassword, assertUserOwnsRecord, isValidUuid, userOwnsRecord } from "../src/lib/auth.ts";

test("email and password validation reject malformed inputs but accept real examples", () => {
  assert.equal(normalizeAuthEmail(" USER@example.com \n"), "user@example.com");
  assert.equal(normalizeAuthEmail("  "), "");
  assert.equal(validatePassword("Passw0rd!"), true);
  assert.equal(validatePassword("short"), false);
  assert.equal(validatePassword("password"), false);
});

test("ownership checks prevent cross-user access and spoofed identities", () => {
  assert.doesNotThrow(() => assertUserOwnsRecord("user-a", "user-a"));
  assert.throws(() => assertUserOwnsRecord("user-a", "user-b"), AppError);
  assert.throws(() => assertUserOwnsRecord(undefined, "user-b"), AppError);
  assert.throws(() => assertUserOwnsRecord("user-a", undefined), AppError);
});

test("transcript identifiers are validated before access is granted", () => {
  assert.equal(isValidUuid("3f8c98c9-d596-4a39-a996-c9d3352a748d"), true);
  assert.equal(isValidUuid("not-a-uuid"), false);
  assert.equal(isValidUuid(""), false);
});

test("transcript detail ownership rejects foreign and ownerless records", () => {
  assert.equal(userOwnsRecord("user-a", "user-a"), true);
  assert.equal(userOwnsRecord("user-a", "user-b"), false);
  assert.equal(userOwnsRecord(null, "user-b"), false);
  assert.equal(userOwnsRecord("user-a", null), false);
});
