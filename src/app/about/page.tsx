import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Sonnetra's mission to make spoken video content more accessible, including Amharic and other languages.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Sonnetra",
    description: "A transcript extraction tool built around real processing, readable text, and clear ownership boundaries.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <PublicPageShell
      title="About Sonnetra"
      intro="Sonnetra aims to make spoken video content easier to access and work with, including Amharic and other global languages when source transcripts are available."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>Making spoken content easier to reach</h2>
            <p>Sonnetra exists to make spoken video content more useful to people who learn, research, teach, or communicate through text. A readable transcript can support accessibility, help someone revisit a lesson, or make a long discussion easier to search without replacing the original video.</p>
            <p>We want language communities to be able to find and work with their digital material. That includes respecting Amharic and other languages as written, not treating them as a secondary or disposable form of content.</p>
          </article>
          <article className="page-card">
            <h2>Faithful to source and availability</h2>
            <p>Sonnetra requests transcript text from its configured provider and presents the result with available language and timing information. Whether a transcript can be retrieved depends on the video and source captions; the product does not promise captions for every upload or invent missing words.</p>
            <p>We aim to provide readable output, clear access boundaries, and practical tools that encourage people to verify important passages against the source.</p>
          </article>
        </div>
      </section>

      <section className="page-section">
        <div className="page-grid three-column">
          <article className="page-card">
            <h3>Timestamped transcript support</h3>
            <p>When the provider includes timing information, Sonnetra keeps it available alongside the transcript text.</p>
          </article>
          <article className="page-card">
            <h3>Unicode and Amharic</h3>
            <p>Unicode content is preserved across provider normalization, persistence, and viewing so Amharic text remains as intended.</p>
          </article>
          <article className="page-card">
            <h3>Authenticated history</h3>
            <p>Signed-in users can access transcript history that is tied to their account and protected by server-side ownership rules.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Ready to start?</p>
          <h2>Extract a transcript from a YouTube video.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Extract a Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
