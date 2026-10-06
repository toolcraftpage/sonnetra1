import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube transcript with timestamps",
  description: "Find a YouTube transcript with timestamps when the original source includes them, along with search and export support.",
  alternates: { canonical: "/youtube-transcript-with-timestamps" },
  openGraph: {
    title: "YouTube transcript with timestamps",
    description: "Read transcript text with segment timing preserved from the source when available.",
    url: "/youtube-transcript-with-timestamps",
  },
};

export default function YouTubeTranscriptWithTimestampsPage() {
  return (
    <PublicPageShell
      title="YouTube transcript with timestamps"
      intro="When a transcript includes timing data, Sonnetra keeps those timestamps in the reader so the transcript remains easy to navigate without rewriting the source wording."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>Why timestamps matter</h2>
            <p>Timestamps help users move between the exact parts of a video they care about, whether they are reviewing lectures, interviews, or research footage.</p>
          </article>
          <article className="page-card">
            <h2>How Sonnetra handles them</h2>
            <p>The transcript reader keeps segment timing in view and allows navigation to the relevant part of the transcript while preserving the original timing values returned by the source.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Explore the transcript</p>
          <h2>Use the real transcript viewer to inspect the text and timestamps.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
