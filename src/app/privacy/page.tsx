import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Read the privacy information for Sonnetra, including how transcript data, access tokens, and authentication are handled.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Sonnetra privacy",
    description: "Privacy details for transcript processing, access control, and data handling in Sonnetra.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <PublicPageShell
      title="Privacy"
      intro="Sonnetra is designed to keep transcript processing and access control transparent, restricted, and server-side governed."
    >
      <section className="page-section legal-section">
        <div className="page-card">
          <h2>How transcript data is handled</h2>
          <p>Transcript content is processed on the server and stored in the configured persistence layer. The browser does not become the final authority on transcript ownership or content access.</p>
          <p>Authenticated users are only able to access transcripts associated with their account through ownership checks. Anonymous access is controlled by server-issued access tokens that must match the correct job and user context.</p>
          <p>Service-role credentials and provider secrets remain server-side and are not exposed to browser clients.</p>
        </div>
      </section>

      <section className="page-section legal-section">
        <div className="page-card">
          <h2>Security and access boundaries</h2>
          <p>Sonnetra keeps the core protection model in place: row-level security, ownership validation, and worker-side processing remain the source of truth rather than client-side state.</p>
          <p>Public pages do not expose internal API routes, private transcript IDs, or sensitive job metadata. The public website is intended to present general product information without revealing private operational details.</p>
        </div>
      </section>
    </PublicPageShell>
  );
}
