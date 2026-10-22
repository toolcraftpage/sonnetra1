import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createJobAccessToken, hashJobAccessToken } from "../src/server/job-access.ts";
import { queryForTranscriptJobContext, transcriptJobByIdQuery } from "../src/server/repositories/transcript-job-access-query.ts";

test("anonymous job access persists only a deterministic token hash", () => {
  const access = createJobAccessToken();

  assert.notEqual(access.token, access.hash);
  assert.equal(hashJobAccessToken(access.token), access.hash);
  assert.notEqual(hashJobAccessToken(`${access.token}-wrong`), access.hash);
});

test("anonymous job queries require the matching job access-token hash", () => {
  const tokenA = "token-hash-a";
  const tokenB = "token-hash-b";
  const jobA = "00000000-0000-4000-8000-000000000001";
  const jobB = "00000000-0000-4000-8000-000000000002";

  assert.equal(transcriptJobByIdQuery(jobA, { userId: null, requestId: "r1", accessTokenHash: tokenA }), `transcript_jobs?id=eq.${jobA}&access_token_hash=eq.${tokenA}`);
  assert.equal(transcriptJobByIdQuery(jobA, { userId: null, requestId: "r2", accessTokenHash: tokenB }), `transcript_jobs?id=eq.${jobA}&access_token_hash=eq.${tokenB}`);
  assert.equal(transcriptJobByIdQuery(jobB, { userId: null, requestId: "r3", accessTokenHash: tokenA }), `transcript_jobs?id=eq.${jobB}&access_token_hash=eq.${tokenA}`);
  assert.equal(transcriptJobByIdQuery(jobA, { userId: null, requestId: "r4" }), `transcript_jobs?id=eq.${jobA}&id=eq.00000000-0000-0000-0000-000000000000`);
  assert.equal(transcriptJobByIdQuery(jobA, { userId: "user-a", requestId: "r5" }), `transcript_jobs?id=eq.${jobA}&user_id=eq.user-a`);
  assert.equal(transcriptJobByIdQuery(jobA, { userId: "user-b", requestId: "r6" }), `transcript_jobs?id=eq.${jobA}&user_id=eq.user-b`);
  assert.match(queryForTranscriptJobContext({ userId: null, requestId: "r7" }), /id=eq\.00000000-0000-0000-0000-000000000000/);
});

test("transcript tables retain enabled owner-based RLS without public allow-all policies", () => {
  const migration = readFileSync(new URL("../supabase/migrations/20260927000100_initial_schema.sql", import.meta.url), "utf8");

  for (const table of ["transcript_jobs", "transcripts", "transcript_segments", "transcript_languages"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }
  assert.match(migration, /transcript_jobs_select_own[\s\S]*?user_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.match(migration, /transcripts_select_own[\s\S]*?user_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.match(migration, /transcript_segments_select_own[\s\S]*?t\.user_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.doesNotMatch(migration, /create policy[^;]+using\s*\(\s*true\s*\)/i);
});