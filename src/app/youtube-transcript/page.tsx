import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube transcript",
  description: "Learn how Sonnetra turns a YouTube URL into a readable transcript with timestamps, search, and export tools.",
  alternates: { canonical: "/youtube-transcript" },
  openGraph: {
    title: "YouTube transcript with Sonnetra",
    description: "Paste a YouTube URL and turn spoken content into a usable transcript with search and export support.",
    url: "/youtube-transcript",
  },
};

export default function YouTubeTranscriptPage() {
  return (
    <PublicPageShell
      title="YouTube transcript"
      intro="Turn a YouTube video into readable transcript text you can search, copy, and export with the source workflow kept server-side and controlled."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>What Sonnetra does</h2>
            <p>Sonnetra validates a YouTube URL, creates a real transcript job, and surfaces the transcript when the provider returns usable text. The result is a searchable transcript workspace built around the actual processor output, not a mock transcript.</p>
          </article>
          <article className="page-card">
            <h2>What you can do</h2>
            <p>Read the transcript, search it by keyword, move between timestamped segments, copy the text, and export as TXT, SRT, VTT, or JSON when the source data is available.</p>
          </article>
        </div>
      </section>

      <section className="page-section">
        <div className="page-grid four-column">
          <article className="page-card step-card">
            <span className="step-number">01</span>
            <p>Paste a supported YouTube URL.</p>
          </article>
          <article className="page-card step-card">
            <span className="step-number">02</span>
            <p>Sonnetra validates the source and creates the job.</p>
          </article>
          <article className="page-card step-card">
            <span className="step-number">03</span>
            <p>The transcript is processed and stored.</p>
          </article>
          <article className="page-card step-card">
            <span className="step-number">04</span>
            <p>Read, search, copy, or export the result.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Start now</p>
          <h2>Get the transcript from a YouTube video.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
