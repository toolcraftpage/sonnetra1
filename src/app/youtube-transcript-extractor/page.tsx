import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube transcript extractor",
  description: "See how Sonnetra extracts transcript content from supported YouTube videos and presents it in an easy-to-read format.",
  alternates: { canonical: "/youtube-transcript-extractor" },
  openGraph: {
    title: "YouTube transcript extractor",
    description: "Extract readable transcript text from a YouTube video and use the result in search, copy, and export workflows.",
    url: "/youtube-transcript-extractor",
  },
};

export default function YouTubeTranscriptExtractorPage() {
  return (
    <PublicPageShell
      title="YouTube transcript extractor"
      intro="YouTube transcript extraction works best when the source is valid, the job is real, and the transcript result is readable after processing."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>What extraction gives you</h2>
            <p>Extraction produces transcript text that can be read, copied, searched, and exported without losing the original wording or timing context when it is present.</p>
          </article>
          <article className="page-card">
            <h2>What makes it trustworthy</h2>
            <p>The process remains server-side, and access stays controlled by job ownership and anonymous token validation rather than a public shortcut.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Extract a transcript</p>
          <h2>Try the real transcript workflow.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
