import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common Sonnetra questions about transcript extraction, transcript access, supported formats, and product behavior.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Sonnetra FAQ",
    description: "Learn how Sonnetra handles transcript extraction, anonymous access, search, and export workflows.",
    url: "/faq",
  },
};

const faqs = [
  { question: "What is Sonnetra?", answer: "Sonnetra is a transcript extraction workspace for YouTube videos. It helps users validate a source, process a transcript job, and read or export the result." },
  { question: "How do I get a YouTube transcript?", answer: "Paste a supported YouTube URL into the homepage form and submit it. The app validates the URL and creates a transcript job before processing the transcript." },
  { question: "Do I need an account?", answer: "No. The app supports anonymous transcript extraction. Signed-in users also get authenticated transcript history and protected access to their own transcripts." },
  { question: "Can I use Sonnetra anonymously?", answer: "Yes. Anonymous jobs follow the server-side workflow and are protected by a server-issued access token tied to the specific job." },
  { question: "Does Sonnetra support Amharic?", answer: "Unicode content is preserved through provider normalization, persistence, search, copy, and export flows, including Amharic text." },
  { question: "Are timestamps preserved?", answer: "When the provider provides timing data, Sonnetra retains those timestamps in the transcript reader and export formats where appropriate." },
  { question: "Can I search a transcript?", answer: "Yes. The transcript reader supports case-insensitive, Unicode-aware text search, with result counts and Previous/Next navigation." },
  { question: "Can I copy a transcript?", answer: "Yes. The transcript reader uses the browser Clipboard API to copy the persisted transcript text and reports failure if the browser rejects the operation." },
  { question: "Which export formats are supported?", answer: "Sonnetra supports TXT, SRT, VTT, and JSON export for persisted transcript data." },
  { question: "What happens when a transcript cannot be retrieved?", answer: "The job remains in a real lifecycle state and the app reports that the transcript is unavailable or temporarily unavailable instead of inventing a result." },
  { question: "Can another user access my transcript?", answer: "No. Authenticated access is limited by ownership checks on the server and anonymous access is tied to the correct job token." },
  { question: "Does Sonnetra rewrite transcript text?", answer: "The application preserves the transcript content returned by the provider and stores it in a normalized form without changing the underlying spoken text." },
];

export default function FAQPage() {
  return (
    <PublicPageShell
      title="Frequently asked questions"
      intro="Common questions about how Sonnetra works, what it supports, and what kinds of transcript workflows it is designed for."
    >
      <section className="page-section">
        <div className="faq-stack">
          {faqs.map((item) => (
            <details key={item.question} className="faq-item" open={item.question === faqs[0].question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Need a transcript?</p>
          <h2>Start with a YouTube URL and let Sonnetra do the work.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
