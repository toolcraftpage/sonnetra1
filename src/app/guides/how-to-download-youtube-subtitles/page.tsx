import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "How to download YouTube subtitles",
  description: "Learn how Sonnetra supports transcript downloads in practical file formats after transcript processing.",
  alternates: { canonical: "/guides/how-to-download-youtube-subtitles" },
  openGraph: {
    title: "How to download YouTube subtitles",
    description: "Download transcript text in standard formats after processing through Sonnetra's transcript workflow.",
    url: "/guides/how-to-download-youtube-subtitles",
  },
};

export default function GuideHowToDownloadYouTubeSubtitlesPage() {
  return (
    <PublicPageShell
      title="How to download YouTube subtitles"
      intro="If the transcript is available, Sonnetra can export the result in standard formats that are useful for notes, captions, and downstream processing."
    >
      <section className="page-section">
        <div className="page-card">
          <h2>Practical use</h2>
          <p>After processing succeeds, use the export menu to download the transcript in the format you need. Availability is tied to the actual transcript data rather than placeholder or fake output.</p>
        </div>
      </section>
      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Get started</p>
          <h2>Process the transcript and then export it.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}
