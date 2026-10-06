import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube transcript Amharic",
  description: "Learn how Sonnetra preserves Amharic and other Unicode transcript text when the underlying source is available.",
  alternates: { canonical: "/youtube-transcript-amharic" },
  openGraph: {
    title: "YouTube transcript Amharic",
    description: "Preserve Amharic transcript text with Sonnetra's Unicode-safe workflow when the source transcript exists.",
    url: "/youtube-transcript-amharic",
  },
};

export default function YouTubeTranscriptAmharicPage() {
  return (
    <PublicPageShell
      title="YouTube transcript Amharic"
      intro="Sonnetra preserves Unicode transcript text for multilingual content, including Amharic, when the underlying transcript is available through the provider and processing flow."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>Unicode support</h2>
            <p>Sonnetra keeps Unicode-safe handling through the provider output, transcript normalization, and transcript reader so that language-specific text remains readable rather than being flattened or replaced.</p>
          </article>
          <article className="page-card">
            <h2>What availability depends on</h2>
            <p>Amharic transcript availability depends on the real source transcript and the underlying provider. Sonnetra does not claim that every video has a transcript or that every language is always available.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Try it</p>
          <h2>Paste a source URL and use the real transcript workflow.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
