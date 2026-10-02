import { errorResponse, successResponse } from "@/lib/api-response";
import { ERROR_CODES, RATE_LIMIT_DEFAULTS } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { assertAllowed, DevelopmentRateLimiter } from "@/lib/rate-limit";
import { getRequestId } from "@/lib/request-id";
import { parseJsonBody } from "@/lib/security";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { parseYouTubeUrlOrThrow } from "@/lib/youtube-url";
import { TranscriptJobService } from "@/server/transcript-jobs";

const limiter = new DevelopmentRateLimiter();
const languagePattern = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/u;

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user.id;
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  try {
    const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    await assertAllowed(await limiter.check(`transcript:${clientKey}`, RATE_LIMIT_DEFAULTS.transcript.limit, RATE_LIMIT_DEFAULTS.transcript.windowMs));
    const body = await parseJsonBody<unknown>(request);
    if (!body || typeof body !== "object" || !("url" in body)) {
      throw new AppError(ERROR_CODES.INVALID_URL, "A YouTube URL is required.");
    }
    const input = body as { url: unknown; language?: unknown };
    const source = parseYouTubeUrlOrThrow(input.url);
    if (input.language !== undefined && (typeof input.language !== "string" || !languagePattern.test(input.language))) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Language must be a valid ISO language code.");
    }
    const userId = await getAuthenticatedUserId();
    const created = await new TranscriptJobService().create({
      videoId: source.videoId,
      sourceUrl: source.canonicalUrl,
      languageCode: input.language as string | undefined,
      userId,
    }, requestId);
    return successResponse(created, { requestId });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}