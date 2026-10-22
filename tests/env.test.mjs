import assert from "node:assert/strict";
import test from "node:test";
import { checkEnvironmentPresence, getHealthIntegrationStatus, validateEnvironment } from "../src/lib/env.ts";

test("Phase 17 environment presence check reports only presence states", () => {
  const result = checkEnvironmentPresence({
    SUPABASE_URL: "https://supabase.example",
    SUPABASE_SERVICE_ROLE_KEY: "private-test-value",
  });

  assert.equal(result.SUPABASE_URL, "PRESENT");
  assert.equal(result.SUPABASE_SERVICE_ROLE_KEY, "PRESENT");
  assert.equal(result.SUPADATA_API_KEY, "MISSING");
  assert.deepEqual(new Set(Object.values(result)), new Set(["PRESENT", "MISSING"]));
  assert.equal(JSON.stringify(result).includes("private-test-value"), false);
});

test("environment validation reports status without exposing values", () => {
  const environment = {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-test-value",
    SUPABASE_SERVICE_ROLE_KEY: "private-test-value",
  };

  const result = validateEnvironment(environment);
  const serviceKey = result.find(
    ({ name }) => name === "SUPABASE_SERVICE_ROLE_KEY",
  );

  assert.equal(serviceKey?.visibility, "SERVER_ONLY");
  assert.equal(serviceKey?.status, "CONFIGURED");
  assert.equal(
    result.find(({ name }) => name === "SUPADATA_API_KEY")?.status,
    "MISSING",
  );
  assert.equal(
    result.find(({ name }) => name === "NEXT_PUBLIC_APP_URL")?.status,
    "CONFIGURED",
  );
  assert.equal(JSON.stringify(result).includes("private-test-value"), false);
});

test("environment validation rejects non-HTTPS remote application URLs", () => {
  const result = validateEnvironment({
    NEXT_PUBLIC_APP_URL: "http://sonnetra.example",
  });

  assert.equal(
    result.find(({ name }) => name === "NEXT_PUBLIC_APP_URL")?.status,
    "INVALID",
  );
});

test("Supadata key presence is not rejected by an undocumented length rule", () => {
  const result = validateEnvironment({ SUPADATA_API_KEY: "test" });

  assert.deepEqual(result.find(({ name }) => name === "SUPADATA_API_KEY"), {
    name: "SUPADATA_API_KEY",
    visibility: "SERVER_ONLY",
    status: "CONFIGURED",
  });
  assert.equal(JSON.stringify(result).includes('"test"'), false);
});

test("empty Supadata configuration is missing", () => {
  const result = validateEnvironment({ SUPADATA_API_KEY: "  " });

  assert.equal(
    result.find(({ name }) => name === "SUPADATA_API_KEY")?.status,
    "MISSING",
  );
});

test("health reports Supadata configuration as unverified", () => {
  const result = getHealthIntegrationStatus({
    SUPADATA_API_KEY: "test",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "public-test-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-test-key",
  });

  assert.deepEqual(result.supadata, { configuration: "CONFIGURED", verification: "NOT_CHECKED" });
  assert.deepEqual(result.supabase, { configuration: "CONFIGURED", verification: "NOT_CHECKED" });
});

test("health requires server-side Supabase persistence credentials", () => {
  const result = getHealthIntegrationStatus({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "public-test-key",
  });

  assert.deepEqual(result.supadata, { configuration: "MISSING", verification: "NOT_CHECKED" });
  assert.deepEqual(result.supabase, { configuration: "MISSING", verification: "NOT_CHECKED" });
});