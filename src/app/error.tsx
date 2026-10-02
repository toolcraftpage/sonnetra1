"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="site-shell" style={{ paddingTop: "15vh" }}>
      <p className="eyebrow">Something went wrong</p>
      <h1>Sonnetra could not load this view.</h1>
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}