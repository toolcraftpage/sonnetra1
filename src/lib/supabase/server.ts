import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { configurationError } from "@/lib/errors";
import type { Database } from "@/types/database";

export type ServerSupabaseClient = {
  kind: "server" | "service-role";
  url: string;
  key: string;
};

export type AuthenticatedServerSupabaseClient = ReturnType<typeof createServerClient<Database>>;

export function createServerSupabaseClient(
  environment: Record<string, string | undefined> = process.env,
): ServerSupabaseClient {
  const url = environment.SUPABASE_URL?.trim() || environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_ANON_KEY?.trim() || environment.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) throw configurationError("Supabase server configuration is missing.");
  return { kind: "server", url, key };
}

export function createServiceRoleSupabaseClient(
  environment: Record<string, string | undefined> = process.env,
): ServerSupabaseClient {
  const url = environment.SUPABASE_URL?.trim() || environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw configurationError("Supabase service-role configuration is missing.");
  return { kind: "service-role", url, key };
}

export async function createAuthenticatedSupabaseClient(
  environment: Record<string, string | undefined> = process.env,
): Promise<AuthenticatedServerSupabaseClient> {
  const url = environment.SUPABASE_URL?.trim() || environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_ANON_KEY?.trim() || environment.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) throw configurationError("Supabase auth configuration is missing.");

  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const cookie of toSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          }
        } catch {
          // Best-effort cookie synchronization for authenticated requests.
        }
      },
    },
  });
}