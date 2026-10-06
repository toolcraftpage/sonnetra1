import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube transcript downloader",
  description: "Download a YouTube transcript in practical formats such as TXT, SRT, VTT, or JSON from Sonnetra's transcript workflow.",
  alternates: { canonical: "/youtube-transcript-downloader" },
  openGraph: {
    title: "YouTube transcript downloader",
    description: "Use Sonnetra to export transcript content in a useful file format after processing the video.",
    url: "/youtube-transcript-downloader",
  },
};

export default function YouTubeTranscriptDownloaderPage() {
  return (
    <PublicPageShell
      title="YouTube transcript downloader"
      intro="Exporting a transcript is part of the value of the product. Once the transcript exists, Sonnetra supports direct file output in standard formats when the data is available."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>Supported export paths</h2>
            <p>Sonnetra provides plain text and subtitle export styles, including TXT, SRT, VTT, and JSON download patterns for transcript data that has been successfully processed.</p>
          </article>
          <article className="page-card">
            <h2>Realistic limits</h2>
            <p>Export availability depends on real transcript data being present in the system. If there is no transcript, there is no fake export output to present.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Download the transcript</p>
          <h2>Generate the transcript first, then export it in a useful format.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
