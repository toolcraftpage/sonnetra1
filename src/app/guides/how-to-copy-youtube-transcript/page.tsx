import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "How to copy a YouTube transcript",
  description: "A practical guide to copying transcript text from Sonnetra after the transcript is ready.",
  alternates: { canonical: "/guides/how-to-copy-youtube-transcript" },
  openGraph: {
    title: "How to copy a YouTube transcript",
    description: "Use Sonnetra's transcript viewer to copy readable transcript text and keep the source content intact.",
    url: "/guides/how-to-copy-youtube-transcript",
  },
};

export default function GuideHowToCopyYouTubeTranscriptPage() {
  return (
    <PublicPageShell
      title="How to copy a YouTube transcript"
      intro="Once a transcript is available in the viewer, the copy action uses the browser clipboard API to copy the full transcript text or a timestamped variant when applicable."
    >
      <section className="page-section">
        <div className="page-card">
          <h2>Recommended flow</h2>
          <p>Open the transcript after processing, select the copy action, and then use the text in notes, email drafts, study summaries, or document workflows. The app preserves the transcript text rather than rewriting it.</p>
        </div>
      </section>
      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Open a transcript</p>
          <h2>Use the transcript viewer and copy the relevant text.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
