import "server-only";

import { getPublicConfig } from "@/lib/config/public";

export type ServerConfig = ReturnType<typeof getServerConfig>;

export type ProviderConfigurationStatus = "CONFIGURED" | "MISSING" | "INVALID";

export function getSupadataConfiguration(
  environment: Record<string, string | undefined> = process.env,
) {
  const key = environment.SUPADATA_API_KEY?.trim();
  return {
    status: key ? (key.length >= 20 ? "CONFIGURED" : "INVALID") : "MISSING" as ProviderConfigurationStatus,
    apiKey: key,
  } as const;
}

export function getServerConfig(
  environment: Record<string, string | undefined> = process.env,
) {
  return {
    public: getPublicConfig(environment),
    supabaseUrl:
      environment.SUPABASE_URL?.trim() ||
      environment.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    supabaseAnonKey:
      environment.SUPABASE_ANON_KEY?.trim() ||
      environment.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
    supabaseServiceRoleKey: environment.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    supadataApiKey: getSupadataConfiguration(environment).apiKey,
    workerSecret: environment.WORKER_SECRET?.trim(),
    cronSecret: environment.CRON_SECRET?.trim(),
  };
}