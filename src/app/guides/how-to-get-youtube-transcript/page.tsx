import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "How to get a YouTube transcript",
  description: "A practical guide to using Sonnetra to validate a YouTube URL and generate a readable transcript.",
  alternates: { canonical: "/guides/how-to-get-youtube-transcript" },
  openGraph: {
    title: "How to get a YouTube transcript",
    description: "A practical, step-by-step guide to using Sonnetra for transcript extraction.",
    url: "/guides/how-to-get-youtube-transcript",
  },
};

export default function GuideHowToGetYouTubeTranscriptPage() {
  return (
    <PublicPageShell
      title="How to get a YouTube transcript"
      intro="Use the homepage input to submit a valid YouTube URL and let the server-side Sonnetra workflow turn it into a readable transcript result."
    >
      <section className="page-section">
        <div className="page-card">
          <h2>Step by step</h2>
          <ol>
            <li>Open the Sonnetra homepage and paste a YouTube URL.</li>
            <li>Wait for the server to validate the source and create the transcript job.</li>
            <li>Open the transcript once the result is ready.</li>
            <li>Search, copy, or export the transcript as needed.</li>
          </ol>
        </div>
      </section>
      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Try it</p>
          <h2>Start with a supported YouTube URL.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
