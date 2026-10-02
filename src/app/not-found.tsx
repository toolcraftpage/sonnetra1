import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-shell" style={{ paddingTop: "15vh" }}>
      <p className="eyebrow">404 / Not found</p>
      <h1>That page is not here.</h1>
      <p className="hero-copy"><Link href="/">Return to Sonnetra</Link></p>
    </main>
  );
}