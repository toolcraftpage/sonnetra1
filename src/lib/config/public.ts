import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

export type PublicConfig = {
  appName: string;
  appDescription: string;
  appUrl: string;
};

export function getPublicConfig(
  environment: Record<string, string | undefined> = process.env,
): PublicConfig {
  const configuredUrl = environment.NEXT_PUBLIC_APP_URL?.trim();

  return {
    appName: environment.NEXT_PUBLIC_APP_NAME?.trim() || APP_NAME,
    appDescription: APP_DESCRIPTION,
    appUrl: isSafePublicUrl(configuredUrl) ? configuredUrl : "http://localhost:3000",
  };
}

function isSafePublicUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname));
  } catch {
    return false;
  }
}