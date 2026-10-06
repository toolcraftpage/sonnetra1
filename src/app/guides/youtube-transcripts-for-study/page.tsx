import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube transcripts for study",
  description: "How students can use transcript text for review, note-taking, and language learning when the transcript is available.",
  alternates: { canonical: "/guides/youtube-transcripts-for-study" },
  openGraph: {
    title: "YouTube transcripts for study",
    description: "Use YouTube transcripts as a study aid for review, note-taking, and deeper learning.",
    url: "/guides/youtube-transcripts-for-study",
  },
};

export default function GuideYouTubeTranscriptsForStudyPage() {
  return (
    <PublicPageShell
      title="YouTube transcripts for study"
      intro="Transcripts are useful for review and structured note-taking when you need to revisit key ideas without rewatching an entire video."
    >
      <section className="page-section">
        <div className="page-card">
          <h2>Legitimate use</h2>
          <p>Transcripts support study workflows such as review, summary writing, concept mapping, and language learning. They are best used as a readable companion to the original video rather than a substitute for respecting the source creator's rights or platform policies.</p>
        </div>
      </section>
      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Start the workflow</p>
          <h2>Add the source URL and build the transcript.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
