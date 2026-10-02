# Testing Strategy

## Current coverage

The executable Node test suite covers URL parsing, Supadata normalization fixtures, provider/transcript HTTP error mappings, Unicode/Amharic preservation, database invariants, legal job lifecycle transitions, and bounded exponential retry policy. Fixtures are test-only pure objects and are never used by production routes. In the current Phase 8C run, the Supadata key is missing, so no live provider request or provider-backed persistence test was performed.

Phase 8B verified the Supabase link, remote migrations, and a real read-only query. A real transcript job, its database rows, and browser completion remain **BLOCKED** until Supadata is configured. Docker is not required for the hosted project and was not used.

## Planned coverage

For local end-to-end verification, configure `SUPADATA_API_KEY` in `.env.local` (server-only), configure the worker secret, start the application with `npm run dev`, then submit a public video with known captions and invoke the protected worker route. Verify job status and transcript DTO through Sonnetra routes; do not call Supadata from the browser. Never place credentials in client variables or test fixtures.

Integration tests will cover provider validation, retry classification, route authorization, rate limits, and RLS isolation. End-to-end tests will exercise the real user workflow against configured services without fabricated transcript results.

Every phase requires typecheck, lint, tests, build, audit, and diff checks. A check that depends on unavailable provider credentials must be reported as blocked, not silently substituted with fake data.
