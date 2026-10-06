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
  { href: "/guides/how-to-get-youtube-transcript", title: "How to get a YouTube transcript" },
  { href: "/guides/how-to-copy-youtube-transcript", title: "How to copy a YouTube transcript" },
  { href: "/guides/how-to-download-youtube-subtitles", title: "How to download YouTube subtitles" },
  { href: "/guides/youtube-transcripts-for-study", title: "YouTube transcripts for study" },
  { href: "/guides/youtube-transcripts-for-research", title: "YouTube transcripts for research" },
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
              <p>Practical guidance for using the transcript workflow, reading the result, and preserving context while you work.</p>
              <Link href={guide.href} className="secondary-link">Read guide</Link>
            </article>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
