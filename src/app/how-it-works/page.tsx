import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "How It Works",
  description: "See how Sonnetra validates a YouTube URL, creates a transcript job, retrieves transcript data, and makes it searchable and exportable.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How Sonnetra works",
    description: "A straightforward server-side workflow for validating YouTube URLs and producing readable transcripts.",
    url: "/how-it-works",
  },
};

const steps = [
  "Paste a YouTube URL into the extraction workspace.",
  "Sonnetra validates the URL and creates a transcript job.",
  "The server processes the job and retrieves transcript data from the configured provider.",
  "The transcript is normalized, persisted, and becomes searchable, copyable, and downloadable.",
];

export default function HowItWorksPage() {
  return (
    <PublicPageShell
      title="How Sonnetra works"
      intro="The product follows a clear server-side workflow so transcript extraction remains dependable and reviewable."
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

      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>Processing happens through the server</h2>
            <p>When you submit a YouTube URL, Sonnetra validates the source and creates a durable transcript job. The server then retrieves data through the configured transcript provider and stores the result in a structured, later-retrievable form.</p>
          </article>
          <article className="page-card">
            <h2>Auth and anonymous flows stay separate</h2>
            <p>Signed-in users retain ownership over their transcript history, while anonymous jobs remain protected by server-issued access tokens. The browser never becomes the source of truth for transcript ownership.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Try it now</p>
          <h2>Turn a YouTube video into a transcript you can search and use.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Extract a Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
