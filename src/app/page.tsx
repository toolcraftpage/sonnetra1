import Link from "next/link";
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
          <a href="#workspace">Workspace</a>
          <a href="#principles">Principles</a>
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign up</Link>
          <a href="/api/health">System status</a>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Transcript workspace</p>
          <h1 id="hero-title">Turn YouTube videos into text you can use.</h1>
          <p className="hero-copy">
            Sonnetra is being built for complete, searchable, copyable transcripts,
            with timestamps and first-class Unicode support.
          </p>
          <div id="workspace" className="workspace-panel" aria-labelledby="workspace-title">
            <YouTubeUrlValidator />
          </div>
        </section>

        <section id="principles" className="principles" aria-labelledby="principles-title">
          <div>
            <p className="eyebrow">Built for trust</p>
            <h2 id="principles-title">Useful before it is loud.</h2>
          </div>
          <div className="principle-list">
            <article>
              <span>01</span>
              <h3>Complete source</h3>
              <p>Original provider text will remain immutable and separate from AI output.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Language-aware</h3>
              <p>Amharic, mixed-language text, and Unicode are treated as core data.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Honest status</h3>
              <p>Missing integrations will be reported clearly instead of simulated.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>SONNETRA / Engineering foundation</span>
        <span>Phase 1</span>
      </footer>
    </div>
  );
}
