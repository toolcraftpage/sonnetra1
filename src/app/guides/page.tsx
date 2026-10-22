import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Guides",
  description: "Helpful guides about YouTube transcript extraction, copy, export, and practical use cases for Sonnetra.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Sonnetra guides",
    description: "Practical guidance for getting, reading, exporting, and using YouTube transcripts.",
    url: "/guides",
  },
};

const guides = [
  { href: "/guides/how-to-get-youtube-transcript", title: "How to get a YouTube transcript", description: "Validate a supported video URL and follow the transcript job through to its result." },
  { href: "/guides/how-to-copy-youtube-transcript", title: "How to copy a YouTube transcript", description: "Copy source text or timestamped segments when timing data is available." },
  { href: "/guides/how-to-download-youtube-subtitles", title: "How to download YouTube subtitles", description: "Choose a transcript export format and understand when timed formats are available." },
  { href: "/guides/youtube-transcripts-for-study", title: "YouTube transcripts for study", description: "Use source transcripts as a companion for review and note-taking." },
  { href: "/guides/youtube-transcripts-for-research", title: "YouTube transcripts for research", description: "Keep quotations and references tied to their source video." },
  { href: "/guides/youtube-transcript-timestamps", title: "YouTube transcript timestamps", description: "Understand segment timing and timestamped exports when source timing exists." },
  { href: "/guides/youtube-transcript-amharic", title: "YouTube transcripts in Amharic", description: "Work with Amharic transcript text when the provider can retrieve it." },
  { href: "/guides/extract-amharic-transcripts-language-learning", title: "How to Extract Amharic Transcripts for Language Learning", description: "Use available Amharic captions as a careful companion to listening, vocabulary review, and language study." },
  { href: "/guides/ethics-youtube-transcripts-research", title: "The Ethics of Using YouTube Transcripts for Research", description: "Consider consent, context, citation, copyright, and responsible handling when studying video transcripts." },
  { href: "/guides/unicode-and-language-codes", title: "How Sonnetra Preserves Unicode and Language Codes", description: "Understand Unicode text, language requests, and the limits of transcript language metadata." },
];

export default function GuidesPage() {
  return (
    <PublicPageShell
      title="Guides"
      intro="Helpful, practical articles that explain how Sonnetra fits into common transcript workflows without claiming unsupported outcomes."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          {guides.map((guide) => (
            <article key={guide.href} className="page-card">
              <h2>{guide.title}</h2>
              <p>{guide.description}</p>
              <Link href={guide.href} className="secondary-link">Read guide</Link>
            </article>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
