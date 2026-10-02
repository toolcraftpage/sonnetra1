# Sonnetra Roadmap

## Phase 0: Architecture

Completed in this foundation: repository scaffold, environment contract, folder structure, system boundaries, data model, Supabase RLS strategy, API plan, provider boundary, job model, authentication model, export and AI boundaries, security model, SEO and AdSense constraints, premium and future API direction, and validation strategy.

## Phase 0.5: Engineering readiness

Completed: valid npm lockfile and successful clean `npm ci`; required `next`, `tsc`, and `eslint` executables; strict typecheck, lint, test, and production build gates; redacted environment status checker; and eight foundation tests. No Supabase project is linked, no migrations exist, and local Supabase/Docker is not required yet.

## Phase 1: Foundation

Completed: typed constants and domain contracts, safe public/server configuration, structured errors, request IDs, JSON logging, API response helpers, provider registry, Supabase client boundaries, development-only rate-limit abstraction, security utilities, health endpoint, metadata/robots/sitemap, accessible shell states, and foundation tests. CI and tracked migration workflow remain next steps. No product operations were added.

## Phase 2: Database foundation

Completed offline: relational schema migration, foreign keys, checks, indexes, timestamp triggers, auth profile trigger, RLS policies, interim database contract, repository contracts, and database invariant tests. Supabase is not linked, no production tables or records were created, and local migration lint is blocked because Docker/Postgres is unavailable. Live migration application, generated Supabase types, and integration/RLS tests are next environment-dependent steps.

## Phase 2-6: Core workflow

Build the accessible shell, URL parser, provider interface, validated transcript service, reader, search, copy, and export formats. No fake transcript data or progress is permitted.

## Phase 7-8: Account and AI

Add Supabase Auth, RLS-backed library workflows, persisted AI jobs, separate outputs, and usage enforcement.

## Phase 9-14: Growth and launch

Add original SEO resources, privacy-conscious analytics, premium interfaces without fake billing, performance/accessibility hardening, end-to-end tests, deployment, and launch audit.

## Phase gate

No phase advances while typecheck, lint, tests, or build has a critical failure. Missing external credentials are environment blockers and must be reported explicitly; they must never be replaced with fake provider responses, fake users, fake progress, or fake statistics.
