export type EnvironmentStatus = "CONFIGURED" | "MISSING" | "INVALID";
export type EnvironmentVisibility = "PUBLIC" | "SERVER_ONLY";

export type EnvironmentEntry = {
  name: string;
  visibility: EnvironmentVisibility;
  status: EnvironmentStatus;
};

export type HealthIntegrationStatus = {
  configuration: EnvironmentStatus;
  verification: "NOT_CHECKED";
};

type EnvironmentRule = {
  name: string;
  visibility: EnvironmentVisibility;
  validate?: (value: string) => boolean;
};

const rules: EnvironmentRule[] = [
  {
    name: "NEXT_PUBLIC_APP_URL",
    visibility: "PUBLIC",
    validate: isSafeWebUrl,
  },
  { name: "NEXT_PUBLIC_APP_NAME", visibility: "PUBLIC" },
  {
    name: "SUPABASE_URL",
    visibility: "SERVER_ONLY",
    validate: isSafeWebUrl,
  },
  { name: "SUPABASE_ANON_KEY", visibility: "SERVER_ONLY" },
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    visibility: "PUBLIC",
    validate: isSafeWebUrl,
  },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", visibility: "PUBLIC" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", visibility: "SERVER_ONLY" },
  { name: "SUPADATA_API_KEY", visibility: "SERVER_ONLY" },
  { name: "WORKER_SECRET", visibility: "SERVER_ONLY" },
  { name: "CRON_SECRET", visibility: "SERVER_ONLY" },
  { name: "AI_PROVIDER_API_KEY", visibility: "SERVER_ONLY" },
  { name: "PAYMENT_PROVIDER_SECRET_KEY", visibility: "SERVER_ONLY" },
];

export const phase17EnvironmentNames = [
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPADATA_API_KEY",
  "WORKER_SECRET",
  "CRON_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

export type EnvironmentPresence = "PRESENT" | "MISSING";

export function checkEnvironmentPresence(
  environment: Record<string, string | undefined> = process.env,
): Record<(typeof phase17EnvironmentNames)[number], EnvironmentPresence> {
  return Object.fromEntries(
    phase17EnvironmentNames.map((name) => [
      name,
      environment[name]?.trim() ? "PRESENT" : "MISSING",
    ]),
  ) as Record<(typeof phase17EnvironmentNames)[number], EnvironmentPresence>;
}

function isSafeWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const isLocalHost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]";

    return (
      !url.username &&
      !url.password &&
      (url.protocol === "https:" ||
        (url.protocol === "http:" && isLocalHost))
    );
  } catch {
    return false;
  }
}

export function getHealthIntegrationStatus(
  environment: Record<string, string | undefined> = process.env,
): { supabase: HealthIntegrationStatus; supadata: HealthIntegrationStatus } {
  const entries = validateEnvironment(environment);
  const supabaseUrlName = environment.SUPABASE_URL?.trim()
    ? "SUPABASE_URL"
    : "NEXT_PUBLIC_SUPABASE_URL";
  const supabaseKey = environment.SUPABASE_ANON_KEY?.trim()
    || environment.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const supabaseServiceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const supabaseUrl = environment.SUPABASE_URL?.trim()
    || environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseUrlStatus = entries.find(({ name }) => name === supabaseUrlName)?.status;
  const supadataStatus = entries.find(({ name }) => name === "SUPADATA_API_KEY")?.status ?? "MISSING";
  const supabaseConfiguration: EnvironmentStatus = !supabaseUrl || !supabaseKey || !supabaseServiceRoleKey
    ? "MISSING"
    : supabaseUrlStatus === "INVALID"
      ? "INVALID"
      : "CONFIGURED";

  return {
    supabase: { configuration: supabaseConfiguration, verification: "NOT_CHECKED" },
    supadata: { configuration: supadataStatus, verification: "NOT_CHECKED" },
  };
}

export function validateEnvironment(
  environment: Record<string, string | undefined> = process.env,
): EnvironmentEntry[] {
  return rules.map(({ name, visibility, validate }) => {
    const value = environment[name]?.trim();
    let status: EnvironmentStatus = "MISSING";

    if (value) {
      status = validate && !validate(value) ? "INVALID" : "CONFIGURED";
    }

    return { name, visibility, status };
  });
}