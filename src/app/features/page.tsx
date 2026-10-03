import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore the transcript extraction and reading features available in Sonnetra, including search, copy, exports, timestamps, and Unicode support.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "Sonnetra features",
    description: "Searchable transcripts, copy/export tools, and resilient extraction features for YouTube content.",
    url: "/features",
  },
};

const features = [
  { title: "YouTube transcript extraction", text: "Paste a supported YouTube URL and launch a real transcript job." },
  { title: "Timestamped segments", text: "When timing data is available, the transcript reader keeps the original timing context." },
  { title: "Searchable reading", text: "Search transcript text with case-insensitive matching and quick Previous/Next navigation." },
  { title: "Copy transcript text", text: "Copy the text from the persisted transcript using the browser clipboard API." },
  { title: "TXT export", text: "Export the transcript as plain text for quick reuse or notes." },
  { title: "SRT export", text: "Generate SRT content for captions and editing workflows." },
  { title: "VTT export", text: "Export a VTT file for media and caption workflows." },
  { title: "JSON export", text: "Download transcript data in a structured JSON format for downstream processing." },
  { title: "Unicode preservation", text: "Mixed-language content remains intact, including Amharic and other Unicode text." },
  { title: "Anonymous and authenticated usage", text: "Use the app in public anonymous flows or keep a signed-in transcript history." },
  { title: "Responsive transcript reader", text: "The document-style reader is designed to remain usable on desktop and mobile." },
  { title: "History for signed-in users", text: "Authenticated users can return to previously completed transcripts from their dashboard." },
];

export default function FeaturesPage() {
  return (
    <PublicPageShell
      title="Features"
      intro="Sonnetra focuses on real transcript extraction, readable output, and practical document workflows for long-form video content."
    >
      <section className="page-section">
        <div className="page-grid three-column">
          {features.map((feature) => (
            <article key={feature.title} className="page-card">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Get started</p>
          <h2>Use Sonnetra to turn a video into a usable transcript.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Extract a Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
