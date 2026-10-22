import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "How to Extract Amharic Transcripts for Language Learning",
  description:
    "A practical guide to studying available Amharic YouTube captions with transcripts, listening practice, vocabulary notes, and source checks.",
  alternates: { canonical: "/guides/extract-amharic-transcripts-language-learning" },
  openGraph: {
    title: "How to Extract Amharic Transcripts for Language Learning",
    description:
      "Use available Amharic captions as a companion to careful listening and language study.",
    url: "/guides/extract-amharic-transcripts-language-learning",
  },
};

export default function ExtractAmharicTranscriptsLanguageLearningGuide() {
  return (
    <PublicPageShell
      title="How to Extract Amharic Transcripts for Language Learning"
      intro="A transcript can make spoken Amharic easier to revisit, but it works best as a companion to listening and source verification. This guide explains a careful workflow using captions that are actually available."
    >
      <article className="page-section guide-copy">
        <h2>Start with an available Amharic source</h2>
        <p>
          Choose a public YouTube video that is useful for your current learning goal:
          a conversation, a lesson, an interview, or a presentation with speech you can
          follow. Before requesting a transcript, check whether the video or its creator
          provides captions in Amharic. Caption coverage varies by upload, region, and
          language. Sonnetra can request transcript text from its provider, but it cannot
          create captions that the source does not supply or guarantee that every video
          has an Amharic track.
        </p>
        <p>
          When you are ready, open the <Link href="/#workspace">Sonnetra transcript tool</Link>,
          paste a supported YouTube URL, and enter the Amharic language code, <code>am</code>,
          in the optional language field. Submit the job and wait for its real result.
          If the provider cannot retrieve a suitable transcript, choose another source or
          continue with the video and captions available in YouTube. Do not interpret an
          unavailable result as evidence that the speaker did not use Amharic.
        </p>

        <h2>Pair written text with listening</h2>
        <p>
          Use the transcript to support, not replace, listening. First listen to a short
          passage without reading. Then review the corresponding text and listen again.
          This sequence encourages you to notice familiar sounds and new vocabulary rather
          than reading ahead throughout the recording. If timing information is included,
          use the segments to return to a particular moment. If timestamps are absent,
          navigate by searching for a distinctive word or phrase and use the video player
          to confirm the context.
        </p>
        <p>
          Amharic is written with Ethiopic characters, and a text display should preserve
          those characters instead of transliterating them unexpectedly. Read a phrase
          aloud, compare it with the audio, and note where the written transcript is
          uncertain or differs from what you hear. Caption punctuation, spelling, word
          boundaries, and speaker labels may not reflect a teacher&apos;s preferred
          transcription conventions. A transcript is a useful study aid, not an authoritative
          dictionary or a guarantee of perfect recognition.
        </p>

        <h2>Turn a transcript into active practice</h2>
        <p>
          Make a small vocabulary list with the word, its surrounding phrase, and the
          timestamp or video link where it appears. Keeping the phrase is valuable because
          meaning and grammar depend on context. You can mark expressions to ask a teacher
          about, compare repeated words across a lesson, or revisit a short passage after
          a day or two. Avoid collecting more text than you can review; a few carefully
          checked lines can be more useful than a long, unannotated transcript.
        </p>
        <p>
          Search can help locate a term in a long recording. Copying or exporting a result
          can help with private notes and classroom preparation, subject to the video&apos;s
          terms and applicable copyright rules. Keep the source title and link with your
          notes, and do not publish substantial transcript excerpts unless you have the
          necessary rights or permission. If you are studying with classmates, share the
          original video and your own observations rather than assuming a private access
          link is public.
        </p>

        <h2>Understand language requests and limitations</h2>
        <p>
          Requesting <code>am</code> asks the provider for a transcript in that language;
          it is not a translation command. A video may have captions only in another
          language, no captions, or a transcript that the provider cannot access. If a
          result arrives, check its language metadata and compare sample passages with the
          original audio. A mismatch can occur because of the source captions, recognition
          quality, or language labeling. For guidance on Ethiopic text and language
          metadata, see <Link href="/guides/unicode-and-language-codes">how Sonnetra preserves Unicode and language codes</Link>.
        </p>

        <h2>Build a respectful study routine</h2>
        <p>
          Choose material you are allowed to access, credit creators when discussing their
          work, and follow the platform&apos;s rules. Transcripts can improve access to
          spoken knowledge and help learners preserve their own notes, but they do not
          transfer ownership of the recording or its words. Verify quotations in the video,
          respect privacy when content includes personal stories, and seek qualified
          language feedback for important translations or formal writing.
        </p>
        <p>
          To try the workflow, <Link href="/#workspace">open the transcript tool</Link> with a
          video whose Amharic captions are available. For the product&apos;s language
          availability notes, read the <Link href="/guides/youtube-transcript-amharic">Amharic transcript guide</Link>.
        </p>
      </article>
    </PublicPageShell>
  );
}
