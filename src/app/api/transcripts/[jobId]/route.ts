import { errorResponse, successResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { getRequestId } from "@/lib/request-id";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { contextForAnonymousToken, TranscriptJobService } from "@/server/transcript-jobs";

async function resolveRequestContext(request: Request, requestId: string) {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!error && user) {
    return { userId: user.id, requestId };
  }

  return contextForAnonymousToken(request.headers.get("x-job-token"), requestId);
}

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const requestId = getRequestId(request);
  try {
    const { jobId } = await params;
    const context = await resolveRequestContext(request, requestId);
    const job = await new TranscriptJobService().get(jobId, context);
    if (!job) throw new AppError("NOT_FOUND", "Transcript job not found.");
    const transcript = job.status === "completed"
      ? await new TranscriptJobService().getResult(jobId, context)
      : null;
    return successResponse({ job, ...(transcript ? { transcript } : {}) }, { requestId });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const requestId = getRequestId(request);
  try {
    const { jobId } = await params;
    const context = await resolveRequestContext(request, requestId);
    const job = await new TranscriptJobService().retryFailed(jobId, context);
    return successResponse({ job, retryScheduled: true }, { requestId });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}