# Sonnetra

Sonnetra is a YouTube transcript application with a durable Supabase job pipeline and a server-side Supadata provider. The Phase 8B Supabase project link, remote migrations, and a real read-only query have been verified. Phase 8C live transcript retrieval is not verified: `SUPADATA_API_KEY` is currently missing from `.env.local`.

## Foundation

- Next.js `16.3.6` App Router with TypeScript and Tailwind CSS
- npm is the package manager for this workspace
- Supabase CLI is available locally; the configured project link and remote migrations were verified in Phase 8B
- `package-lock.json` is the reproducible dependency manifest; use `npm ci` for clean installs
- Environment status can be inspected with `npm run check:env`; only names and statuses are printed
- `GET /api/health` reports application readiness and whether optional Supabase/Supadata configuration is present
- `POST /api/sources/validate` deterministically parses a YouTube URL without contacting YouTube or a transcript provider
- `POST /api/transcripts` creates a durable queued job; the browser polls `GET /api/transcripts/:jobId` with a one-time anonymous job token
- `POST /api/internal/worker` is the bounded, worker-secret-protected invocation boundary and uses the real Supadata provider registry
- `SUPADATA_API_KEY` is server-only; without it, worker processing cannot retrieve a transcript
- The data model is defined by the offline Supabase migration in `supabase/migrations/`; no fake records are seeded
- Architecture, database, API, security, provider, deployment, monetization, SEO, testing, and roadmap plans live in [`docs/`](docs/)
- Copy `.env.example` to `.env.local` when configuring local integrations; never commit secrets

## Local development

```bash
npm ci
npm run dev
```

Validation commands:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The test command uses Node's built-in test runner; no test-only dependency is required. Node's TypeScript type stripping is used for the small TypeScript environment utility.

## YouTube URL validation

The canonical parser accepts exact hostnames `youtube.com`, `www.youtube.com`, `m.youtube.com`, and `youtu.be`, with HTTP or HTTPS. It supports watch, short, shorts, embed, and live forms and normalizes them to `https://www.youtube.com/watch?v=VIDEO_ID`. IDs must be exactly 11 characters from `[A-Za-z0-9_-]`. Query parameters such as timestamps, playlists, tracking values, and unknown values are not part of identity; fragments, credentials, ports, unsupported hosts, and unsupported paths are rejected.

Validation proves only that the URL is structurally supported. It does not prove that a video exists, that a transcript exists, or that a language is available.

The Supadata adapter calls `GET https://api.supadata.ai/v1/transcript` server-side with `x-api-key`, `mode=native`, and timestamped chunks. An optional language is forwarded. Provider responses are normalized before persistence; no fixture or mock provider is enabled in production. Configure `SUPADATA_API_KEY` in `.env.local` for local use and never prefix it with `NEXT_PUBLIC_`.

The durable worker claims jobs through PostgreSQL functions and atomically persists transcript metadata and ordered segments. The browser never calls Supadata or Supabase directly. A real Supadata-backed job, transcript persistence, and browser completion still require a configured provider key and have not been proven by the current Phase 8C verification.

## Phase 1 boundaries

The application provides typed domain contracts, safe configuration access, structured errors, request IDs, redacted logging, API response helpers, a replaceable provider registry, Supabase server boundaries, a development-only rate limiter, URL/input validation, and a transcript UI with status polling, refresh recovery, copy, and new-job actions. Missing integrations fail truthfully; no transcript result is fabricated.

Phase 2 adds relational tables, foreign keys, constraints, indexes, RLS policies, an interim database type contract, repository contracts, and offline database invariant tests. Phase 3 adds no database writes. Apply migrations only after configuring and linking an intended Supabase project.

## Delivery phases

See [`docs/roadmap.md`](docs/roadmap.md) for the phase gates. Each phase requires typecheck, lint, tests, and build before the next phase begins.
