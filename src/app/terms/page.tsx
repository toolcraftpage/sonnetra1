import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Terms",
  description: "Read the Sonnetra terms of use, including transcript processing use, content responsibility, and access policy expectations.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Sonnetra terms",
    description: "Terms of use for transcript extraction, account access, data handling, and accepted usage of Sonnetra.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <PublicPageShell
      title="Terms of use"
      intro="These terms cover general usage of Sonnetra and define the expected product boundaries for transcript extraction and access."
    >
      <section className="page-section legal-section">
        <div className="page-card">
          <h2>Accepted use</h2>
          <p>Sonnetra is provided as a transcript extraction and reading tool for lawful, practical processing of YouTube content. Users are expected to comply with applicable platform policies, copyright rules, and local legal requirements when using the service.</p>
          <p>The service is intended to support transcript workflows such as note-taking, review, accessibility, research, and content analysis. It is not a replacement for a legal or licensing review.</p>
        </div>
      </section>

      <section className="page-section legal-section">
        <div className="page-card">
          <h2>Copyright disclaimer</h2>
          <p>We do not claim ownership of extracted transcripts. Users are solely responsible for ensuring their use complies with YouTube&apos;s Terms of Service and applicable copyright laws.</p>
        </div>
      </section>

      <section className="page-section legal-section">
        <div className="page-card">
          <h2>Service reliability</h2>
          <p>Sonnetra may be unavailable, rate-limited, or unable to retrieve a transcript for a given video depending on source conditions, provider behavior, or system capacity. The product should be treated as a practical workflow tool rather than a guaranteed source of all transcript content.</p>
          <p>Users remain responsible for verifying the accuracy, completeness, and legality of any transcript they use, copy, share, or export.</p>
        </div>
      </section>
    </PublicPageShell>
  );
}
