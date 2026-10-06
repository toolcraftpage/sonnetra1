import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube transcript generator",
  description: "Understand how Sonnetra works as a transcript generator for valid YouTube URLs and real transcript retrieval workflows.",
  alternates: { canonical: "/youtube-transcript-generator" },
  openGraph: {
    title: "YouTube transcript generator",
    description: "Create a readable transcript from a YouTube video by validating the source and processing the transcript job.",
    url: "/youtube-transcript-generator",
  },
};

export default function YouTubeTranscriptGeneratorPage() {
  return (
    <PublicPageShell
      title="YouTube transcript generator"
      intro="A transcript generator is only useful when it follows a real processing workflow. Sonnetra validates the source and turns the result into a clean, useful transcript for reading and export."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>How the workflow works</h2>
            <p>Submit a supported YouTube URL. Sonnetra validates it, creates a transcript job, and then retrieves transcript text through the server-side provider flow. The result is a durable transcript record that can be searched and exported.</p>
          </article>
          <article className="page-card">
            <h2>Useful outputs</h2>
            <p>Once processing succeeds, you can read the transcript, move between timestamped segments, copy the text, and export it in plain text or subtitle formats where the source data supports them.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Generate a transcript</p>
          <h2>Start with the real URL input and process the transcript.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
