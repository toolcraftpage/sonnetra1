import { NextResponse } from "next/server";

import { getServerConfig } from "@/lib/config/server";
import { APP_NAME, API_VERSION, REQUEST_ID_HEADER } from "@/lib/constants";
import { getRequestId, withRequestId } from "@/lib/request-id";

export function GET(request: Request) {
  const requestId = getRequestId(request);
  const config = getServerConfig();
  const response = NextResponse.json({
    success: true,
    data: {
      application: APP_NAME,
      status: "healthy",
      apiVersion: API_VERSION,
      integrations: {
        supabase: Boolean(config.supabaseUrl && config.supabaseAnonKey),
        supadata: Boolean(config.supadataApiKey),
      },
    },
    requestId,
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return withRequestId(response, requestId);
}