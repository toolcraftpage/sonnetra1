import Link from "next/link";

import { AdSenseSlot } from "@/components/adsense-slot";
import { YouTubeUrlValidator } from "@/components/youtube-url-validator";

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
