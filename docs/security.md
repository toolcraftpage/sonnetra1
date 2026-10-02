# Sonnetra Security Model

This describes current security boundaries and remaining verification. Phase 8B verified the Supabase project link and remote migrations. The durable-job migration did not change RLS; a provider-backed job and its database authorization behavior have not been exercised in Phase 8C.

## Input and provider safety

- Parse and canonicalize YouTube URLs with an allowlist of supported hostnames and URL forms.
- The allowlist is exact: `youtube.com`, `www.youtube.com`, `m.youtube.com`, and `youtu.be`; wildcard subdomains and `youtube-nocookie.com` are not trusted.
- URL validation rejects credentials, explicit ports, fragments, control characters, lookalike domains, unsupported protocols, and multiple URLs. It never fetches the supplied URL, so it is not a generic fetch or redirect feature.
- Video IDs must be exactly 11 characters from `[A-Za-z0-9_-]`. This is a syntax check, not an existence check.
- Supadata is server-only and receives only the canonical Sonnetra URL. The API key is sent in the server-side `x-api-key` header and is never logged, serialized, or imported by client code.
- Anonymous durable jobs are bound to a random server-issued token; only its SHA-256 hash is persisted. Status reads without a valid token cannot enumerate anonymous jobs. Worker execution requires a timing-safe comparison against server-only `WORKER_SECRET`.
- Enforce request size, timeouts, rate limits, and bounded retries server-side. Provider retries are limited to transient failures and include a short jittered delay.
- Treat provider metadata and transcript text as untrusted data; render text, never raw HTML.
- Do not fetch arbitrary user-supplied hosts, preventing SSRF through URL validation.

## Identity and authorization

Supabase Auth is a planned identity boundary; current transcript jobs use the anonymous token flow. Every user-owned query must scope by the authenticated subject, and PostgreSQL RLS remains the final authorization boundary. Client-provided user IDs are ignored.

The migration enables RLS on profiles, jobs, transcripts, segments, languages, saved transcripts, folders, folder items, AI jobs, AI outputs, usage, subscriptions, and entitlements. Child-row policies derive ownership through parent relationships to prevent IDOR by changing a UUID.

## Secrets and observability

Service-role, provider, worker, payment, and AI secrets are server-only and absent from client bundles. Logs contain request IDs and safe error codes, never tokens, transcript content, or unnecessary personal data.

The service-role Supabase helper is server-only and intended only for trusted workers, migrations, and server-controlled usage/billing writes. It must never be imported by a client component or used to authorize browser requests.

## Rate limits and abuse controls

Apply server-side limits by operation, authenticated subject, anonymous session, and provider cost where appropriate. Protect transcript, AI, export, and authentication endpoints. Use atomic counters or a managed store to prevent parallel-request bypasses, and return `429` with a retry hint without revealing quota internals.

## Privacy, SEO, and ads

Collect only data needed to operate the service, document retention and deletion, and provide privacy, terms, and contact pages before launch. SEO pages must be original and useful, not transcript scraping pages. An `AdSlot` boundary may be added only to substantial content views; ads must be clearly distinct from controls and never appear on empty, error, or core action states.

## Verification

Offline tests cover URL parsing, structured errors, provider normalization, Unicode/Amharic preservation, and job transitions. Live RLS isolation, provider-backed authorization, and full browser secret scanning remain verification gates.

URL validation is intentionally distinct from video lookup and transcript retrieval. The worker uses the canonical video ID and source URL. Future deduplication may key work by authenticated user, video ID, and requested language; a shared video source must not imply shared private transcript ownership.

The worker uses PostgreSQL row locks for claiming and an atomic completion function for transcript and segment persistence. Retry attempts are bounded; stale processing jobs become claimable after the processing lease. No raw provider response, authorization header, API key, or transcript content is logged.
