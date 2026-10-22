import assert from "node:assert/strict";
import { once } from "node:events";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { resolve } from "node:path";
import test from "node:test";
import { normalizeSupadataResponse } from "../src/lib/providers/supadata-normalizer.ts";
import { requestSupadataTranscript } from "../src/lib/providers/supadata-http.ts";
import { canonicalYouTubeSourceUrl } from "../src/lib/youtube-url.ts";
import { validateDisposableProjectRef } from "./helpers/supabase-test-target.mjs";

const integrationEnabled = process.env.SONNETRA_SUPABASE_INTEGRATION === "1";
if (integrationEnabled && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const sourceUrl = "https://www.youtube.com/watch?v=aqz-KE-bpKQ";
const videoId = "aqz-KE-bpKQ";
const requestTimeoutMs = 120_000;
const validJobIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const validAccessTokenPattern = /^[A-Za-z0-9_-]{43}$/u;
const buildTargetBlockedMessage = "INTEGRATION TEST BLOCKED: Existing build target cannot be verified.";

function integrationConfiguration() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const aliases = [
    ["SUPABASE_URL", supabaseUrl],
    ["NEXT_PUBLIC_SUPABASE_URL", publicSupabaseUrl],
    ["SUPABASE_ANON_KEY", anonKey],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", publicAnonKey],
  ];
  const missingAliases = aliases.filter(([, value]) => !value).map(([name]) => name);
  if (missingAliases.length) {
    throw new Error(`Integration configuration is missing required Supabase aliases: ${missingAliases.join(", ")}.`);
  }
  if (supabaseUrl !== publicSupabaseUrl) {
    throw new Error("Integration configuration aliases must match exactly: SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL.");
  }
  if (anonKey !== publicAnonKey) {
    throw new Error("Integration configuration aliases must match exactly: SUPABASE_ANON_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  validateDisposableProjectRef(
    process.env.SUPABASE_DB_TEST_PROJECT_REF?.trim(),
    supabaseUrl,
  );

  const required = [
    ["SUPABASE_ANON_KEY", anonKey],
    ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()],
    ["SUPADATA_API_KEY", process.env.SUPADATA_API_KEY?.trim()],
    ["WORKER_SECRET", process.env.WORKER_SECRET?.trim()],
  ];
  const missing = required.filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) {
    throw new Error(`Integration configuration is missing required server values: ${missing.join(", ")}.`);
  }

  return {
    anonKey: required[0][1],
    serviceRoleKey: required[1][1],
    supadataApiKey: required[2][1],
    workerSecret: required[3][1],
    supabaseUrl: new URL(supabaseUrl).origin,
  };
}

function verifyBuildTarget(configuration) {
  let buildId;
  let manifest;
  try {
    buildId = readFileSync(resolve(".next/BUILD_ID"), "utf8").trim();
    manifest = JSON.parse(readFileSync(resolve(".next/sonnetra-integration-build-target.json"), "utf8"));
  } catch {
    throw new Error(buildTargetBlockedMessage);
  }

  const expectedFingerprint = createHash("sha256")
    .update(JSON.stringify({
      NEXT_PUBLIC_SUPABASE_URL: configuration.supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: configuration.anonKey,
    }))
    .digest("hex");
  if (
    !buildId
    || !manifest
    || typeof manifest !== "object"
    || Array.isArray(manifest)
    || manifest.version !== 1
    || manifest.buildId !== buildId
    || manifest.supabaseUrl !== configuration.supabaseUrl
    || !/^[0-9a-f]{64}$/u.test(manifest.configFingerprint ?? "")
    || manifest.configFingerprint !== expectedFingerprint
  ) {
    throw new Error(buildTargetBlockedMessage);
  }
}

async function retrieveProviderReference(configuration) {
  const canonicalUrl = canonicalYouTubeSourceUrl(videoId, sourceUrl);
  const response = await requestSupadataTranscript({
    sourceUrl: canonicalUrl,
    apiKey: configuration.supadataApiKey,
    requestId: randomUUID(),
  });
  return normalizeSupadataResponse(response, { videoId, sourceUrl: canonicalUrl });
}

async function reserveLoopbackPort() {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  assertCondition(address && typeof address === "object", "Could not reserve a local integration-test port.");
  const { port } = address;
  await new Promise((resolveClose, reject) => {
    server.close((error) => error ? reject(error) : resolveClose());
  });
  return port;
}

async function startApplication(configuration) {
  verifyBuildTarget(configuration);

  const port = await reserveLoopbackPort();
  const appUrl = `http://127.0.0.1:${port}`;
  const nextCli = resolve("node_modules/next/dist/bin/next");
  if (!existsSync(nextCli)) {
    throw new Error("The installed Next.js server command is unavailable.");
  }

  const child = spawn(process.execPath, [
    nextCli,
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
    windowsHide: true,
  });

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error("The local production server exited before becoming ready.");
    }
    try {
      const response = await fetch(`${appUrl}/api/health`, {
        signal: AbortSignal.timeout(2_000),
      });
      if (response.ok) return { appUrl, child };
    } catch {
      // Keep readiness polling bounded while the child server starts.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  child.kill();
  await once(child, "exit");
  throw new Error("The local production server did not become ready in time.");
}

async function stopApplication(child) {
  if (child.exitCode !== null) return;
  child.kill();
  const exited = await Promise.race([
    once(child, "exit").then(() => true),
    new Promise((resolveWait) => setTimeout(() => resolveWait(false), 5_000)),
  ]);
  assertCondition(exited, "The local production server did not stop cleanly.");
}

async function requestJson(url, options, operation) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch {
    throw new Error(`${operation} request failed before receiving a response.`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`${operation} returned an invalid JSON response.`);
  }
  return { response, body };
}

function assertCondition(condition, message) {
  assert.ok(condition, message);
}

async function authorizedJobRead(appUrl, jobId, accessToken) {
  const { response, body } = await requestJson(
    `${appUrl}/api/transcripts/${encodeURIComponent(jobId)}`,
    { headers: { "x-job-token": accessToken, accept: "application/json" } },
    "Authorized transcript job read",
  );
  assertCondition(response.ok && body.success === true, "Authorized job-token retrieval did not succeed.");
  return body.data;
}

async function cleanupOwnedJob(configuration, appUrl, jobId, accessToken) {
  assertCondition(validJobIdPattern.test(jobId), "Cleanup refused because the test job identifier is invalid.");
  assertCondition(validAccessTokenPattern.test(accessToken), "Cleanup refused because the test access token is invalid.");
  const owned = await authorizedJobRead(appUrl, jobId, accessToken);
  assertCondition(
    owned.job?.id === jobId && owned.job?.videoId === videoId,
    "Cleanup refused because the authorized application read did not confirm this test-owned job.",
  );

  const accessTokenHash = createHash("sha256").update(accessToken).digest("hex");
  const cleanupUrl = new URL("/rest/v1/transcript_jobs", configuration.supabaseUrl);
  cleanupUrl.searchParams.set("id", `eq.${jobId}`);
  cleanupUrl.searchParams.set("access_token_hash", `eq.${accessTokenHash}`);
  cleanupUrl.searchParams.set("select", "id");

  const { response, body } = await requestJson(cleanupUrl, {
    method: "DELETE",
    headers: {
      apikey: configuration.serviceRoleKey,
      Authorization: `Bearer ${configuration.serviceRoleKey}`,
      Prefer: "return=representation",
    },
  }, "Test-owned record cleanup");

  assertCondition(
    response.ok && Array.isArray(body) && body.length === 1 && body[0].id === jobId,
    "Cleanup did not confirm deletion of exactly the test-owned job.",
  );
}

test("real Supadata transcript persists through the application and enforces anonymous access", {
  skip: integrationEnabled ? false : "set SONNETRA_SUPABASE_INTEGRATION=1 only after authorizing a disposable project",
}, async () => {
  const configuration = integrationConfiguration();
  const application = await startApplication(configuration);
  let hasFailure = false;
  let failure;
  try {
    let creationAttempted = false;
    let cleanupJobId;
    let cleanupAccessToken;
    try {
      const providerReference = await retrieveProviderReference(configuration);
      const expectedFullText = providerReference.segments.map((segment) => segment.text).join("\n");
      creationAttempted = true;
      const created = await requestJson(`${application.appUrl}/api/transcripts`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      }, "Transcript job creation");

      const returnedJobId = created.body.data?.job?.id;
      const returnedAccessToken = created.body.data?.accessToken;
      if (typeof returnedJobId === "string" && validJobIdPattern.test(returnedJobId)) {
        cleanupJobId = returnedJobId;
      }
      if (typeof returnedAccessToken === "string" && validAccessTokenPattern.test(returnedAccessToken)) {
        cleanupAccessToken = returnedAccessToken;
      }

      assertCondition(created.response.ok && created.body.success === true, "Application job creation failed.");
      assertCondition(cleanupJobId, "Application did not return a valid job identifier.");
      assertCondition(cleanupAccessToken, "Application did not return a valid job access token.");
      const jobId = cleanupJobId;
      const accessToken = cleanupAccessToken;

      const workerResult = await requestJson(`${application.appUrl}/api/internal/worker`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-worker-secret": configuration.workerSecret,
          accept: "application/json",
        },
        body: JSON.stringify({ jobId }),
      }, "Authorized transcript worker");
      assertCondition(workerResult.response.ok && workerResult.body.success === true, "The real application worker did not complete the transcript.");

      const result = await authorizedJobRead(application.appUrl, jobId, accessToken);
      const job = result.job;
      const transcript = result.transcript;
      assertCondition(job?.status === "completed", "The persisted application job is not completed.");
      assertCondition(job.videoId === videoId && job.sourceUrl === sourceUrl, "The persisted job source identity is not canonical.");
      assertCondition(
        transcript?.metadata?.videoId === videoId && transcript?.metadata?.canonicalUrl === sourceUrl,
        "The persisted transcript source identity does not match the canonical source.",
      );
      assertCondition(transcript?.provider === "supadata", "The persisted transcript did not come from Supadata.");
      assertCondition(
        transcript.fullText === expectedFullText,
        "Persisted transcript text does not match the real provider response.",
      );
      assertCondition(
        Array.isArray(transcript.segments)
          && transcript.segments.length === providerReference.segments.length
          && transcript.segments.every((segment, index) => (
            segment.index === providerReference.segments[index].index
            && segment.text === providerReference.segments[index].text
            && segment.startMs === providerReference.segments[index].startMs
            && segment.endMs === providerReference.segments[index].endMs
          )),
        "Persisted segment count, text, order, or timestamps do not match the real provider response.",
      );
      assertCondition(
        transcript.segments.every((segment) => (
          (segment.startMs === undefined || (Number.isFinite(segment.startMs) && segment.startMs >= 0))
          && (segment.endMs === undefined || (Number.isFinite(segment.endMs) && segment.endMs >= 0))
          && (segment.startMs === undefined || segment.endMs === undefined || segment.endMs >= segment.startMs)
        )),
        "Persisted timestamps are invalid.",
      );
      assertCondition(
        typeof transcript.language?.code === "string"
          && transcript.language.code === providerReference.language.code
          && transcript.language.name === providerReference.language.name
          && transcript.language.isGenerated === (providerReference.language.isGenerated ?? false),
        "Persisted language metadata does not match the real provider response.",
      );

      const invalidToken = randomBytes(32).toString("base64url");
      const unauthorizedRead = await requestJson(
        `${application.appUrl}/api/transcripts/${encodeURIComponent(jobId)}`,
        { headers: { "x-job-token": invalidToken, accept: "application/json" } },
        "Unauthorized transcript read",
      );
      assertCondition(unauthorizedRead.response.status === 404, "A mismatched job token unexpectedly accessed the transcript.");

      const anonymousRlsUrl = new URL("/rest/v1/transcripts", configuration.supabaseUrl);
      anonymousRlsUrl.searchParams.set("job_id", `eq.${jobId}`);
      anonymousRlsUrl.searchParams.set("select", "id");
      const rlsRead = await requestJson(anonymousRlsUrl, {
        headers: { apikey: configuration.anonKey, accept: "application/json" },
      }, "Anonymous RLS read");
      assertCondition(
        rlsRead.response.ok && Array.isArray(rlsRead.body) && rlsRead.body.length === 0,
        "Anonymous Supabase access exposed a transcript despite owner-based RLS.",
      );
    } catch (caught) {
      hasFailure = true;
      failure = caught;
    } finally {
      let cleanupFailure;
      if (creationAttempted) {
        if (cleanupJobId) {
          try {
            await cleanupOwnedJob(configuration, application.appUrl, cleanupJobId, cleanupAccessToken);
          } catch (caught) {
            cleanupFailure = caught;
          }
        } else {
          cleanupFailure = new Error("Cleanup could not safely confirm a test-owned job because the creation response did not provide valid cleanup credentials.");
        }
      }

      if (hasFailure && cleanupFailure) {
        throw new AggregateError([failure, cleanupFailure], "The integration test failed and test-resource cleanup also failed.");
      }
      if (hasFailure) throw failure;
      if (cleanupFailure) throw cleanupFailure;
    }
  } catch (caught) {
    hasFailure = true;
    failure = caught;
    throw caught;
  } finally {
    try {
      await stopApplication(application.child);
    } catch (cleanupFailure) {
      if (hasFailure) {
        throw new AggregateError([failure, cleanupFailure], "The integration test failed and application cleanup also failed.");
      }
      throw cleanupFailure;
    }
  }
});
