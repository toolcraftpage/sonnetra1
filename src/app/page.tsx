import type { Metadata } from "next";
import Link from "next/link";

import { AdSenseSlot } from "@/components/adsense-slot";
import { YouTubeUrlValidator } from "@/components/youtube-url-validator";

export const metadata: Metadata = {
  title: "Free YouTube Transcript Tool",
  description:
    "Extract, search, and copy YouTube transcripts with Sonnetra. Learn how transcripts support accessibility, research, and Amharic language preservation.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      am: "/youtube-transcript-amharic",
    },
  },
};

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Sonnetra home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>SONNETRA</span>
        </Link>
        <nav aria-label="Primary navigation" className="site-nav">
          <Link href="/#workspace">Transcript</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/dashboard">My Transcripts</Link>
          <Link href="/login">Sign In</Link>
          <Link href="/#workspace" className="nav-cta">Get Started</Link>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy-wrap">
            <p className="eyebrow">YouTube transcript workspace</p>
            <h1 id="hero-title">Turn YouTube videos into useful transcripts.</h1>
            <p className="hero-copy">
              Submit a video with available captions to retrieve searchable transcript text. Language and timestamps depend on the source transcript returned by the provider.
            </p>
            <div className="cta-row">
              <a href="#workspace" className="primary-action">Get Transcript</a>
              <Link href="/how-it-works" className="secondary-link">How It Works</Link>
            </div>
            <div className="stats-row" aria-label="Transcript workspace capabilities">
              <div className="stat-card">
                <strong>Source text</strong>
                <span>Transcript wording is preserved</span>
              </div>
              <div className="stat-card">
                <strong>Multiple languages</strong>
                <span>Unicode text stays intact</span>
              </div>
              <div className="stat-card">
                <strong>Useful output</strong>
                <span>Search, copy, and export results</span>
              </div>
            </div>
          </div>

          <div id="workspace" className="workspace-panel" aria-labelledby="workspace-title">
            <YouTubeUrlValidator />
          </div>
        </section>

        <section className="feature-block" aria-labelledby="free-tier-title">
          <div className="free-tier-panel">
            <div>
              <p className="eyebrow">Free tier</p>
              <h2 id="free-tier-title">Try the transcript workflow without a daily countdown.</h2>
              <p>
                Sonnetra does not currently show a per-account daily transcript allowance or a
                remaining-today counter. The transcript endpoint is configured to rate-limit
                requests at 10 submissions per minute per client; that technical safeguard is
                not a daily free-plan quota.
              </p>
            </div>
            <div className="pro-preview">
              <p className="eyebrow">In development</p>
              <h3>Bulk transcript downloads</h3>
              <p>
                A possible Pro workflow for managing multiple transcripts is coming soon.
                No paid plan or bulk-download feature is available yet.
              </p>
              <Link href="/pricing" className="secondary-link">Explore upcoming plans</Link>
            </div>
          </div>
        </section>

        <section className="feature-block home-guide" aria-labelledby="sonnetra-guide-title">
          <div className="section-heading">
            <p className="eyebrow">Transcript guide</p>
            <h2 id="sonnetra-guide-title">A practical guide to getting more from a YouTube transcript</h2>
          </div>

          <article className="guide-copy">
            <h3>How to use Sonnetra</h3>
            <p>
              Start with a public YouTube video that has captions available. Copy its URL from
              the browser or YouTube share menu, then paste the link into the transcript
              workspace above. Sonnetra checks that the address is a supported YouTube source
              before creating a transcript job. If you want a particular language and the
              optional language field is available, enter its language code. A language request
              can only succeed when suitable captions are available from the source provider;
              Sonnetra does not invent a transcript or silently translate one.
            </p>
            <p>
              After submitting, allow the job to finish and review the result in the transcript
              reader. Use search to locate a name, topic, or phrase, and move through the
              segments to understand where a passage occurs. When the original transcript
              includes timestamps, they remain associated with the relevant text. You can copy
              the transcript for your notes or choose from the export formats offered in the
              reader. If processing reports that captions are unavailable, try a different
              video or check whether captions exist in the requested language. Results depend
              on the source and provider, so an unavailable transcript is a valid outcome.
            </p>

            <h3>Why extract YouTube transcripts?</h3>
            <p>
              A transcript gives spoken information another way to be accessed. Readers who
              are deaf or hard of hearing, people in sound-sensitive environments, and viewers
              who process written language more easily can follow content without relying only
              on audio. Text can also make a long lesson or interview easier to revisit: search
              for a subject, scan a section, and return to the video at the point that matters.
              Captions and transcripts do not replace the video’s visual information, but they
              can make its spoken words more reachable.
            </p>
            <p>
              Students and researchers can use transcripts as a starting point for reviewing
              lectures, talks, interviews, and public discussions. Searchable text helps locate
              passages for later checking against the recording. Keep citations and source links
              with your notes, verify important quotations in the original video, and follow
              any rules that apply to your course, publication, or research. A transcript is a
              reading aid, not proof that a statement is accurate or permission to reproduce
              copyrighted material.
            </p>
            <p>
              Language access matters too. Amharic and other languages carry knowledge,
              histories, teaching, and everyday expression that deserve to remain readable
              online. Unicode-aware transcript handling helps preserve Ethiopic characters and
              mixed-language text instead of reducing them to unreadable symbols. Sonnetra can
              work with Amharic when the provider can retrieve an Amharic transcript; it does
              not promise that every video has captions or translate speech that was not
              transcribed. Preserving the source wording and its language context is a small,
              practical part of making digital material easier to study and share responsibly.
            </p>

            <h3>Example use cases</h3>
            <ul>
              <li>A student searches a recorded lecture to review a concept before class.</li>
              <li>A researcher finds a passage in an interview and checks it against the video.</li>
              <li>A language learner compares available Amharic captions with spoken audio.</li>
            </ul>

            <h3>Frequently asked questions</h3>
            <h4>Will Sonnetra find captions for every YouTube video?</h4>
            <p>
              No. Retrieval depends on the video, its available captions, the requested
              language, and provider availability. Sonnetra reports when a transcript cannot
              be retrieved rather than substituting made-up text.
            </p>
            <h4>Does the tool translate or rewrite the transcript?</h4>
            <p>
              No. It works with transcript text returned by the provider. A language option
              requests an available transcript; it is not an automatic translation service.
              Check important text against the original recording.
            </p>
            <h4>Can I reuse or publish an extracted transcript?</h4>
            <p>
              That depends on the rights, permissions, and rules that apply to the source and
              your intended use. You are responsible for checking YouTube&apos;s terms and
              applicable copyright requirements before sharing or republishing material.
            </p>
            <h4>How do I protect my transcript link?</h4>
            <p>
              Treat any private transcript access link or token as sensitive. Do not share it
              publicly unless you intend others to access that transcript, and contact support
              if you need help with account or access questions.
            </p>
          </article>
        </section>

        <section id="how-it-works" className="feature-block" aria-labelledby="how-it-works-title">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2 id="how-it-works-title">A clean workflow from YouTube link to transcript.</h2>
          </div>
          <div className="steps-grid">
            <article className="step-card">
              <span>01</span>
              <h3>Validate source</h3>
              <p>Confirm the URL is a supported YouTube source before the job is created.</p>
            </article>
            <article className="step-card">
              <span>02</span>
              <h3>Create job</h3>
              <p>The real extraction job is created with the correct authenticated or anonymous flow.</p>
            </article>
            <article className="step-card">
              <span>03</span>
              <h3>Read transcript</h3>
              <p>When processing completes, review the saved transcript and use its available timestamps and language metadata.</p>
            </article>
          </div>
        </section>

        <section id="features" className="feature-block alt" aria-labelledby="features-title">
          <div className="section-heading">
            <p className="eyebrow">Built for real use</p>
            <h2 id="features-title">A product experience designed for clarity and trust.</h2>
          </div>
          <div className="info-grid">
            <article className="info-card">
              <h3>Searchable transcript text</h3>
              <p>Scan the recorded text quickly and find the moments you need without rewatching the video.</p>
            </article>
            <article className="info-card">
              <h3>Reliable timestamps</h3>
              <p>Show the original timing context where the source data already includes it, keeping the transcript faithful.</p>
            </article>
            <article className="info-card">
              <h3>Multilingual support</h3>
              <p>Keep Unicode and mixed-language input intact so Amharic and related content remain legible.</p>
            </article>
            <article className="info-card">
              <h3>Safe production workflow</h3>
              <p>Authenticated access, durable job handling, and RLS remain in place rather than being bypassed by a demo UI.</p>
            </article>
          </div>
        </section>

        <AdSenseSlot />

        <section id="faq" className="feature-block faq-section" aria-labelledby="faq-title">
          <div className="section-heading">
            <p className="eyebrow">FAQ</p>
            <h2 id="faq-title">Questions people ask before they start.</h2>
          </div>
          <div className="faq-list">
            <article>
              <h3>Does Sonnetra use a mock transcript?</h3>
              <p>No. The product relies on the real extraction pipeline and persisted transcript data.</p>
            </article>
            <article>
              <h3>Do I need an account?</h3>
              <p>You can use the authenticated flow for account-based access, and the app continues to enforce ownership correctly.</p>
            </article>
            <article>
              <h3>What about language support?</h3>
              <p>Supported language handling follows the existing provider and database configuration, with Unicode content preserved.</p>
            </article>
            <article>
              <h3>Can I copy the final transcript text?</h3>
              <p>Yes. The transcript viewer includes real text output that can be copied directly without altering the original.</p>
            </article>
          </div>
        </section>

        <section className="cta-section" aria-labelledby="cta-title">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2 id="cta-title">Paste a video link and generate the transcript.</h2>
          </div>
          <a href="#workspace" className="primary-action">Get transcript</a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-links">
          <Link href="/#workspace">Transcript</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <span>SONNETRA / YouTube transcripts</span>
      </footer>
    </div>
  );
}
