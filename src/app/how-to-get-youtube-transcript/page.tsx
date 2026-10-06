import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "How to get a YouTube transcript",
  description: "A clear, practical guide to getting a YouTube transcript with Sonnetra using a supported URL and real transcript processing.",
  alternates: { canonical: "/how-to-get-youtube-transcript" },
  openGraph: {
    title: "How to get a YouTube transcript",
    description: "Use Sonnetra to validate a YouTube URL and extract transcript text for reading and export.",
    url: "/how-to-get-youtube-transcript",
  },
};

const steps = [
  "Paste the YouTube URL into the homepage form.",
  "Check that the source is valid and supported by the application.",
  "Run the transcript job once the URL is accepted.",
  "Read, search, or export the transcript once processing succeeds.",
];

export default function HowToGetYouTubeTranscriptPage() {
  return (
    <PublicPageShell
      title="How to get a YouTube transcript"
      intro="The easiest way to get a transcript is to submit a valid YouTube URL to Sonnetra and let the server-side transcript workflow produce a usable result."
    >
      <section className="page-section">
        <div className="page-grid four-column">
          {steps.map((step, index) => (
            <article key={step} className="page-card step-card">
              <span className="step-number">0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Start the workflow</p>
          <h2>Begin with a valid YouTube URL and generate the transcript.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
