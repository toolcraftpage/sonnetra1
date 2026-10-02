# Sonnetra API Plan

The routes below describe the current API surface. Transcript creation is asynchronous and uses a durable job; provider calls happen only in the protected worker route.

## URL validation

`POST /api/sources/validate` accepts `{ "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }` and returns the standard response shape with `videoId`, `canonicalUrl`, `sourceType`, and `originalUrl`. It performs no network or database operation and does not claim video, transcript, or language availability.

Supported hosts are exactly `youtube.com`, `www.youtube.com`, `m.youtube.com`, and `youtu.be`. Supported forms are watch (`v` query parameter), short, shorts, embed, and live. The canonical URL is always `https://www.youtube.com/watch?v=VIDEO_ID`; `t`, `start`, `list`, `index`, `si`, `feature`, `utm_*`, and unknown parameters are discarded from identity. Fragments, credentials, ports, malformed IDs, and unsupported protocols are rejected.

Validation errors use `INVALID_URL`, `UNSUPPORTED_URL`, `UNSUPPORTED_HOST`, `MISSING_VIDEO_ID`, `INVALID_VIDEO_ID`, `MULTIPLE_URLS`, `URL_TOO_LONG`, or `UNSUPPORTED_PROTOCOL` where applicable.

## Transcript retrieval

`POST /api/transcripts` accepts `{ "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "language": "am" }`. It validates and canonicalizes the URL, creates a durable queued job, and returns a job DTO plus a one-time anonymous `accessToken`. It does not call Supadata synchronously.

`GET /api/transcripts/[jobId]` requires `x-job-token`, returns actual lifecycle state, and includes the persisted transcript only after completion. `POST /api/internal/worker` requires the server-only `x-worker-secret`, claims at most three jobs, and uses the registered Supadata provider. Supadata configuration errors fail the job; they do not produce placeholder transcripts.

Implemented mutation routes run on the server and validate request bodies before processing. Responses use stable error codes and human-readable messages without leaking provider or secret details.

## Planned product endpoints

- `POST /api/transcripts`: validate a YouTube URL and create or queue retrieval.
- `GET /api/transcripts/:id`: return an authorized transcript and segments.
- `GET /api/transcripts/:id/languages`: return languages actually discovered.
- `POST /api/transcripts/:id/exports`: create a validated TXT, SRT, VTT, or JSON export.
- `POST /api/transcripts/:id/ai`: enqueue a named AI operation for an authorized transcript.
- `POST /api/library`: save a transcript for the authenticated user.

## Future versioned API

The public API will use `/api/v1` with API keys, quotas, idempotency keys, and job polling. It will share application services with the web product rather than calling web routes internally.

## Error contract

Errors expose `code`, `message`, and optional `retryable`. Invalid URLs, unavailable captions, unsupported languages, authorization failures, provider outages, and rate limits remain distinguishable without exposing secrets.

## Request lifecycle

1. Parse and canonicalize the YouTube URL with an allowlist.
2. Authenticate when the operation requires an account and apply a server-side quota and rate-limit decision.
3. Validate the request schema and create an idempotent job or read an authorized result.
4. Return a stable resource or job status; clients poll status rather than holding an HTTP request open.

The Supadata API key is used only by the server-side adapter. No route exposes Supadata request or response shapes as a browser contract. A real request is blocked until `SUPADATA_API_KEY` is configured.

## Persistence boundary

Transcript job routes use the server repository and atomic database functions; the worker uses the service-role boundary. The browser does not receive the service-role credential. Database RLS remains unchanged by the durable-job migration.

## Phase 1 health endpoint

`GET /api/health` returns `{ success, data, requestId }`. `data.status` is the application process status. `data.integrations.supabase` and `data.integrations.supadata` are booleans derived from configuration presence, not connectivity claims. The response includes `x-request-id` and never returns credentials.
