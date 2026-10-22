import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Learn how Sonnetra handles transcript data, authentication cookies, service providers, and Google AdSense advertising.",
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
          <p>When you submit a YouTube URL, Sonnetra processes the source through its transcript provider and stores job and transcript data in its configured database. The URL, requested language, transcript text, timestamps, and processing details may be handled to provide the service. Supadata may receive the source information needed to retrieve captions under its own terms and privacy practices.</p>
          <p>Authenticated users access transcripts associated with their account through ownership checks. Anonymous transcript access uses a server-issued token bound to the specific job; keep any private transcript link or token confidential. Supabase authentication may use cookies to maintain a signed-in session.</p>
          <p>Service-role credentials and provider secrets are kept on the server and are not sent to browser clients. Data is retained as needed to operate the service and according to the configured storage and account processes; contact support for data-access or deletion questions.</p>
        </div>
      </section>

      <section className="page-section legal-section">
        <div className="page-card">
          <h2>Cookies and advertising</h2>
          <p>Sonnetra uses essential session cookies when authentication features require them. The site also stores your optional-advertising choice in a first-party preference cookie. If Google AdSense is enabled, its script and advertising cookies are not loaded unless you allow optional advertising. You can revisit your choice using the Cookie settings control; changing it affects future ad activation but cannot erase cookies or data already handled by an advertising provider.</p>
          <p>Before serving ads to visitors in the European Economic Area (EEA) or United Kingdom, the production site must use a Google-certified consent management platform (CMP), such as CookieYes or Didomi, configured for applicable consent requirements. This site&apos;s lightweight preference banner is not a certified CMP and does not replace that production requirement.</p>
          <p>You can manage cookies through your browser settings, review <a href="https://myadcenter.google.com/" target="_blank" rel="noreferrer">Google&apos;s ad controls</a>, and read <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">Google&apos;s information about advertising technologies</a>. Blocking essential cookies may prevent sign-in or other session-dependent features from working. Third-party advertising technologies are governed by their providers&apos; own privacy terms.</p>
          <p>For questions about information handled by Sonnetra, email <a href="mailto:hello@sonnetra.app">hello@sonnetra.app</a>. This notice describes the current product at a high level and is not a substitute for advice about legal requirements in a particular jurisdiction.</p>
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
