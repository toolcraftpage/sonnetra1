import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserSupabaseClient } from "../src/lib/supabase/client.ts";

test("browser Supabase client returns undefined when injected public config is missing", () => {
  assert.equal(createBrowserSupabaseClient({}), undefined);
});

test("browser Supabase client accepts trimmed injected public config", () => {
  const client = createBrowserSupabaseClient({
    NEXT_PUBLIC_SUPABASE_URL: " https://example.supabase.co ",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: " public-test-value ",
  });

  assert.ok(client);
});
