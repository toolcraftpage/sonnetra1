import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube subtitles to text",
  description: "Convert YouTube subtitle data into readable text using Sonnetra's transcript processing workflow and export tools.",
  alternates: { canonical: "/youtube-subtitles-to-text" },
  openGraph: {
    title: "YouTube subtitles to text",
    description: "Turn subtitle data into searchable, readable transcript text with Sonnetra.",
    url: "/youtube-subtitles-to-text",
  },
};

export default function YouTubeSubtitlesToTextPage() {
  return (
    <PublicPageShell
      title="YouTube subtitles to text"
      intro="Subtitle data can be converted into a readable transcript when the underlying transcript is available through Sonnetra's real processing workflow."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>What this means</h2>
            <p>When the source video has usable transcript content, Sonnetra keeps the text in a readable format that supports search, copying, and export for further use.</p>
          </article>
          <article className="page-card">
            <h2>What to expect</h2>
            <p>Availability depends on the real provider and the source data itself. Sonnetra does not invent transcript content or claim results that are not present.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Start here</p>
          <h2>Paste a YouTube link and convert the transcript to readable text.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
