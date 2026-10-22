import { NextResponse } from "next/server";

import { APP_NAME, API_VERSION, REQUEST_ID_HEADER } from "@/lib/constants";
import { getHealthIntegrationStatus } from "@/lib/env";
import { getRequestId, withRequestId } from "@/lib/request-id";

export function GET(request: Request) {
  const requestId = getRequestId(request);
  const integrations = getHealthIntegrationStatus();
  const response = NextResponse.json({
    success: true,
    data: {
      application: APP_NAME,
      status: "healthy",
      apiVersion: API_VERSION,
      integrations,
    },
    requestId,
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return withRequestId(response, requestId);
}