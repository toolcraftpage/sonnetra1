# Deployment Plan

Target hosting is Vercel with Supabase for authentication and PostgreSQL. Production secrets are configured in the hosting platform and are never committed.

Before deployment, run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. Create a preview deployment, exercise the real transcript workflow with configured provider credentials, then promote only after the launch checklist passes.
