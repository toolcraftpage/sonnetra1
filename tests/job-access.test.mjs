import assert from "node:assert/strict";
import test from "node:test";
import { resolveJobAccessToken } from "../src/server/job-access.ts";

test("anonymous job tokens are only accepted when present in the supported request forms", () => {
  assert.equal(resolveJobAccessToken(new URLSearchParams("token=abc")), "abc");
  assert.equal(resolveJobAccessToken({ token: "xyz" }), "xyz");
  assert.equal(resolveJobAccessToken({ jobToken: "xyz" }), "xyz");
  assert.equal(resolveJobAccessToken({ token: ["ignored", "final"] }), "final");
  assert.equal(resolveJobAccessToken(new URLSearchParams("")), null);
  assert.equal(resolveJobAccessToken({ token: "  " }), null);
  assert.equal(resolveJobAccessToken({}), null);
});
