import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube transcripts for research",
  description: "A practical overview of using YouTube transcripts in research and analysis workflows when the transcript is available.",
  alternates: { canonical: "/guides/youtube-transcripts-for-research" },
  openGraph: {
    title: "YouTube transcripts for research",
    description: "Use transcript text for research, comparison, and analysis while keeping usage aligned with platform rules and source ownership.",
    url: "/guides/youtube-transcripts-for-research",
  },
};

export default function GuideYouTubeTranscriptsForResearchPage() {
  return (
    <PublicPageShell
      title="YouTube transcripts for research"
      intro="Transcript text can be helpful for reference and deeper analysis when it is available through the actual transcript workflow and used responsibly."
    >
      <section className="page-section">
        <div className="page-card">
          <h2>Research use cases</h2>
          <p>Research workflows may include review of recorded discussions, extracting quoted language, comparing terminology, and organizing ideas around specific topics. The transcript is most useful when it stays faithful to the source and is used as a practical reference.</p>
        </div>
      </section>
      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Generate a transcript</p>
          <h2>Pick a source video and start the transcript flow.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
