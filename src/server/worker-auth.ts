import { timingSafeEqual } from "node:crypto";

export type WorkerAuthMode = "cron" | "worker";

export function isWorkerRequestAuthorized(
  request: Request,
  mode: WorkerAuthMode,
  secrets: { cronSecret?: string; workerSecret?: string },
): boolean {
  const expected = mode === "cron" ? secrets.cronSecret : secrets.workerSecret;
  if (!expected) return false;

  const authorization = request.headers.get("authorization") ?? "";
  const suppliedBearer = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : undefined;

  const suppliedValues = mode === "cron"
    ? [suppliedBearer]
    : [request.headers.get("x-worker-secret") ?? undefined, suppliedBearer];

  return suppliedValues.some((supplied) => {
    if (!supplied) return false;
    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(supplied);
    return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
  });
}