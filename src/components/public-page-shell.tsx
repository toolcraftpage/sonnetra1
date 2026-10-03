import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/features", label: "Features" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export function PublicPageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Sonnetra home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>SONNETRA</span>
        </Link>

        <nav aria-label="Primary navigation" className="site-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
          <Link href="/login">Sign In</Link>
          <Link href="/#workspace" className="nav-cta">Get Started</Link>
        </nav>
      </header>

      <main className="public-page-main">
        <section className="page-intro" aria-labelledby="page-title">
          <p className="eyebrow">Sonnetra</p>
          <h1 id="page-title">{title}</h1>
          {intro ? <p className="page-intro-copy">{intro}</p> : null}
        </section>

        {children}
      </main>

      <footer className="site-footer">
        <div>
          <div className="footer-group">
            <span className="footer-title">Product</span>
            <Link href="/">Home</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/features">Features</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        </div>
        <div>
          <div className="footer-group">
            <span className="footer-title">Company</span>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <div className="footer-group">
            <span className="footer-title">Legal</span>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
