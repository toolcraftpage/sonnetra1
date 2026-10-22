import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube transcript timestamps",
  description: "Understand transcript segment timestamps and when Sonnetra can include timing in copy and subtitle exports.",
  alternates: { canonical: "/guides/youtube-transcript-timestamps" },
  openGraph: {
    title: "YouTube transcript timestamps",
    description: "Learn how segment timing works and when timestamped transcript output is available.",
    url: "/guides/youtube-transcript-timestamps",
  },
};

export default function GuideYouTubeTranscriptTimestampsPage() {
  return (
    <PublicPageShell
      title="YouTube transcript timestamps"
      intro="Transcript timestamps associate a piece of text with a point in the source video. They are useful for returning to a moment, but only when the provider supplies valid timing data."
    >
      <section className="page-section">
        <div className="page-card">
          <h2>What a segment timestamp means</h2>
          <p>A transcript is commonly divided into ordered segments. A segment start indicates where that text begins in the video; an end time, when supplied, marks its duration. These values are source timing metadata, not estimates of sentence length.</p>
        </div>
      </section>
      <section className="page-section">
        <div className="page-card">
          <h2>Use timestamped output</h2>
          <ol>
            <li>Submit a supported YouTube URL through the <Link href="/#workspace">Sonnetra transcript tool</Link>.</li>
            <li>When processing finishes, check the transcript segments for their displayed start times.</li>
            <li>Copy with timestamps or choose SRT/VTT only when the source result contains valid timing for every segment.</li>
            <li>Use TXT for plain transcript text or JSON when you need the stored segment fields.</li>
          </ol>
        </div>
      </section>
      <section className="page-section">
        <div className="page-card">
          <h2>Availability and accuracy</h2>
          <p>Some source transcripts do not include timing, and timing detail can vary by video and provider response. Sonnetra does not invent timestamps when they are absent. Compare the transcript with the original video when exact timing matters.</p>
          <p>For related workflows, see <Link href="/youtube-transcript-with-timestamps">transcripts with timestamps</Link> and the guide to <Link href="/guides/how-to-download-youtube-subtitles">downloading transcript output</Link>.</p>
        </div>
      </section>
      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Use the transcript tool</p>
          <h2>Start with a video that has an available transcript.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}