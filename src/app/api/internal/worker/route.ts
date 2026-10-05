import { timingSafeEqual } from "node:crypto";
import { errorResponse, successResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { getServerConfig } from "@/lib/config/server";
import { createProviderRegistry, requireProvider } from "@/lib/providers";
import { getRequestId } from "@/lib/request-id";
import { TranscriptJobWorker } from "@/server/transcript-jobs";

export function isAuthorized(request: Request): boolean {
  const configuredSecrets = [
    getServerConfig().workerSecret,
    getServerConfig().cronSecret,
  ].filter((value): value is string => Boolean(value));

  const suppliedDirect = request.headers.get("x-worker-secret");
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedBearer = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : undefined;
  const suppliedValues = [suppliedDirect, suppliedBearer].filter((value): value is string => Boolean(value));

  if (configuredSecrets.length === 0 || suppliedValues.length === 0) return false;

  return suppliedValues.some((supplied) => configuredSecrets.some((configured) => {
    const expected = Buffer.from(configured);
    const actual = Buffer.from(supplied);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }));
}

async function parseExactJobId(request: Request): Promise<string | undefined> {
  const contentType = request.headers.get("content-type") ?? "";
  let jobId: string | undefined;

  if (contentType.includes("application/json")) {
    try {
      const body = await request.clone().json();
      if (body && typeof body === "object" && "jobId" in body) {
        const maybeJobId = body.jobId;
        if (typeof maybeJobId === "string") jobId = maybeJobId.trim() || undefined;
      }
    } catch {
      jobId = undefined;
    }
  }

  if (!jobId) {
    const fromQuery = new URL(request.url).searchParams.get("jobId");
    jobId = fromQuery?.trim() || undefined;
  }

  return jobId;
}

async function handleWorkerRequest(request: Request, allowExactJob: boolean) {
  const requestId = getRequestId(request);
  try {
    if (!isAuthorized(request)) throw new AppError("AUTHORIZATION_ERROR", "Worker authorization failed.", { statusCode: 403 });
    const jobId = allowExactJob ? await parseExactJobId(request) : undefined;
    if (jobId && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(jobId)) {
      throw new AppError("VALIDATION_ERROR", "jobId must be a valid UUID.", { statusCode: 400 });
    }

    const provider = requireProvider(createProviderRegistry(), "supadata");
    const processed = await new TranscriptJobWorker(undefined, provider).run(requestId, jobId);
    return successResponse({ processed }, { requestId });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}

export async function GET(request: Request) {
  return handleWorkerRequest(request, false);
}

export async function POST(request: Request) {
  return handleWorkerRequest(request, true);
}