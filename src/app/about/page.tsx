import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "About",
  description: "Learn what Sonnetra does and how transcript extraction works in a privacy-conscious workflow.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Sonnetra",
    description: "A transcript extraction tool built around real processing, readable text, and clear ownership boundaries.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <PublicPageShell
      title="About Sonnetra"
      intro="Sonnetra is a practical transcript extraction workspace for YouTube videos. It helps people turn spoken content into readable, searchable, copyable text without losing source context."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>Built around real transcript extraction</h2>
            <p>Sonnetra is designed for people who want to work with spoken YouTube content in a more usable form. The product focuses on extracting transcripts, preserving timing context, and making the result easy to search and reuse.</p>
            <p>It supports timestamped transcripts, copyable reading flows, and browser-side document-style viewing for published transcript results.</p>
          </article>
          <article className="page-card">
            <h2>Useful for everyday workflows</h2>
            <p>Students, researchers, educators, journalists, content creators, and language learners can all use Sonnetra to work with spoken content in a more accessible format.</p>
            <p>The emphasis stays on real extraction, readable output, and clear ownership boundaries for authenticated and anonymous usage.</p>
          </article>
        </div>
      </section>

      <section className="page-section">
        <div className="page-grid three-column">
          <article className="page-card">
            <h3>Timestamped transcript support</h3>
            <p>When the provider includes timing information, Sonnetra keeps it available alongside the transcript text.</p>
          </article>
          <article className="page-card">
            <h3>Unicode and Amharic</h3>
            <p>Unicode content is preserved across provider normalization, persistence, and viewing so Amharic text remains as intended.</p>
          </article>
          <article className="page-card">
            <h3>Authenticated history</h3>
            <p>Signed-in users can access transcript history that is tied to their account and protected by server-side ownership rules.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Ready to start?</p>
          <h2>Extract a transcript from a YouTube video.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Extract a Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
