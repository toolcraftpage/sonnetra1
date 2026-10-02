import { errorResponse, successResponse } from "@/lib/api-response";
import { RATE_LIMIT_DEFAULTS } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { assertAllowed, DevelopmentRateLimiter } from "@/lib/rate-limit";
import { getRequestId } from "@/lib/request-id";
import { parseJsonBody } from "@/lib/security";
import { parseYouTubeUrlOrThrow } from "@/lib/youtube-url";

const limiter = new DevelopmentRateLimiter();

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  try {
    const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    await assertAllowed(await limiter.check(`source-validate:${clientKey}`, 30, RATE_LIMIT_DEFAULTS.health.windowMs));
    const body = await parseJsonBody<unknown>(request);
    if (!body || typeof body !== "object" || !("url" in body)) {
      throw new AppError("INVALID_URL", "A YouTube URL is required.");
    }
    const result = parseYouTubeUrlOrThrow((body as { url: unknown }).url);
    return successResponse({
      videoId: result.videoId,
      canonicalUrl: result.canonicalUrl,
      sourceType: result.sourceType,
      originalUrl: result.originalUrl,
    }, { requestId });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}