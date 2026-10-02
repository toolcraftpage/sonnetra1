import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export type BrowserSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

export function createBrowserSupabaseClient(
  environment: Record<string, string | undefined> = process.env,
): BrowserSupabaseClient | undefined {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return undefined;
  }

  return createBrowserClient<Database>(url, anonKey);
}