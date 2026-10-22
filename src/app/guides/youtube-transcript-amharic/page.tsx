import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "YouTube transcripts in Amharic",
  description: "Learn how to request and work with Amharic YouTube transcript text when captions are available from the provider.",
  alternates: { canonical: "/guides/youtube-transcript-amharic" },
  openGraph: {
    title: "YouTube transcripts in Amharic",
    description: "Practical guidance for Amharic transcript availability, Unicode text, and source-faithful use.",
    url: "/guides/youtube-transcript-amharic",
  },
};

export default function GuideYouTubeTranscriptAmharicPage() {
  return (
    <PublicPageShell
      title="YouTube transcripts in Amharic"
      intro="Sonnetra can request Amharic transcript text when the provider has a suitable transcript for the video. Availability depends on the source; the tool does not translate videos or promise captions for every upload."
    >
      <section className="page-section">
        <div className="page-card">
          <h2>Request an Amharic transcript</h2>
          <ol>
            <li>Open the <Link href="/#workspace">transcript tool</Link> and enter a supported YouTube URL.</li>
            <li>Choose Amharic (am) in the optional language selector if you want to request that language.</li>
            <li>Wait for the actual job result. If the provider cannot retrieve Amharic captions, Sonnetra reports that result rather than substituting an English transcript or generated translation.</li>
            <li>Check the language shown with the transcript and compare the text with the source video when accuracy is important.</li>
          </ol>
        </div>
      </section>
      <section className="page-section">
        <div className="page-card">
          <h2>Amharic text and Unicode</h2>
          <p>Amharic uses Ethiopic Unicode characters. Sonnetra&apos;s transcript handling is designed to preserve provider text as Unicode through display, search, copy, and export; it does not transliterate Amharic into Latin characters.</p>
          <p>Availability, spelling, punctuation, and segmentation depend on the transcript supplied for the video. Sonnetra does not rewrite or correct the source wording.</p>
        </div>
      </section>
      <section className="page-section">
        <div className="page-card">
          <h2>When no Amharic transcript is available</h2>
          <p>A language request can fail when captions in that language are not available from the provider. Try another video with Amharic captions or use the provider&apos;s available-language information; do not treat a missing transcript as a translation request.</p>
          <p>For general steps, see <Link href="/guides/how-to-get-youtube-transcript">how to get a YouTube transcript</Link> or learn about <Link href="/guides/youtube-transcript-timestamps">timestamped segments</Link>.</p>
        </div>
      </section>
      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Check a real source</p>
          <h2>Request Amharic only when it matches the transcript you need.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Get Transcript</Link>
      </section>
    </PublicPageShell>
  );
}