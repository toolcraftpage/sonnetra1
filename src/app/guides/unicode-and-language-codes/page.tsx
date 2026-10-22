import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "How Sonnetra Preserves Unicode and Language Codes",
  description:
    "Learn how Unicode supports Amharic transcript text, what language codes mean, and why transcript availability depends on the source.",
  alternates: { canonical: "/guides/unicode-and-language-codes" },
  openGraph: {
    title: "How Sonnetra Preserves Unicode and Language Codes",
    description:
      "A practical explanation of multilingual transcript text, Unicode, language requests, and metadata.",
    url: "/guides/unicode-and-language-codes",
  },
};

export default function UnicodeAndLanguageCodesGuide() {
  return (
    <PublicPageShell
      title="How Sonnetra Preserves Unicode and Language Codes"
      intro="Multilingual transcript text depends on both the source captions and correct text handling. This guide explains Unicode, Amharic characters, language codes, and what metadata can—and cannot—tell you."
    >
      <article className="page-section guide-copy">
        <h2>What Unicode does for transcript text</h2>
        <p>
          Unicode is a standard way for computers to represent characters from writing
          systems used around the world. A transcript may contain Latin letters, Ethiopic
          characters used for Amharic, punctuation, numerals, or multiple scripts in the
          same sentence. Unicode-aware systems can store and display those characters
          without treating them as invalid bytes or replacing them with question marks.
          This matters whenever text moves between a provider response, a database, a
          browser, search, copy, and export.
        </p>
        <p>
          Sonnetra is designed to preserve the Unicode text returned by its transcript
          provider through its transcript workflow. It does not transliterate Amharic
          into Latin characters as a default display step. Your browser still needs fonts
          capable of showing the relevant script, and the source transcript itself may
          contain spelling, spacing, or recognition errors. A readable character is not
          proof that the spoken word was recognized correctly; compare important passages
          with the original video.
        </p>

        <h2>Language codes are requests and labels</h2>
        <p>
          Language codes provide a compact way to identify a language in software. A
          code such as <code>am</code> is commonly used for Amharic. Some systems add
          subtags for a region or a more specific language variety. A code can help a
          provider select a transcript track or describe the language associated with a
          result, but it does not change the words in the source.
        </p>
        <p>
          In Sonnetra&apos;s transcript form, the optional language field sends a
          language preference with the job. That is a request for matching captions when
          they are available, not an instruction to translate the audio. A video can
          have captions in one language but not another, or the provider may not be able
          to retrieve the requested track. If Amharic is unavailable, the application
          should report the actual outcome rather than silently substituting an English
          transcript or inventing an Amharic translation.
        </p>
        <p>
          To try a source, open the <Link href="/#workspace">transcript tool</Link>, enter a
          supported YouTube address, and request <code>am</code> if that is the language
          you need. Check the language displayed with the returned transcript and verify
          the text in the original recording. For a focused language-learning workflow,
          see <Link href="/guides/extract-amharic-transcripts-language-learning">our guide to Amharic transcript study</Link>.
        </p>

        <h2>Why text and metadata may not agree</h2>
        <p>
          Language metadata is useful but not infallible. A video can switch languages,
          include loan words or names, or contain more than one speaker. Captions may
          reflect an uploader&apos;s manually prepared file, an automatic recognition
          system, or a track that has been edited over time. The track&apos;s label may
          describe its intended language while individual segments include other
          scripts. A search tool can help find characters or words in the text, but it
          cannot determine the speaker&apos;s intent or resolve a translation ambiguity.
        </p>
        <p>
          When doing careful work, preserve the source language label along with the
          video URL and retrieval context. If you manually correct a transcript for
          personal notes, keep the provider text distinct from your edited version.
          Researchers should document transcription and translation choices, while
          learners should compare uncertain phrases with a trusted speaker, teacher, or
          reference material. Do not treat a language code as a guarantee of completeness,
          dialect coverage, or quality.
        </p>

        <h2>Unicode normalization and practical text use</h2>
        <p>
          Some visually similar text can have different underlying character sequences.
          Unicode normalization is a standardized way systems can compare equivalent
          text representations. Applications must use care with normalization: changing
          characters without understanding the script can affect search, exact quotation,
          or comparisons with the source. Sonnetra&apos;s goal is to preserve the
          provider&apos;s transcript content through normal product operations rather
          than silently rewriting it.
        </p>
        <p>
          When searching, try the exact spelling that appears in the transcript and
          consider alternate spellings if the provider recognized a word inconsistently.
          When copying or exporting, inspect a sample in the destination application to
          confirm its font and encoding support. If text appears corrupted, check the
          target editor and the original captions before concluding that the source data
          was lost.
        </p>

        <h2>Respect the source and its rights</h2>
        <p>
          Unicode makes text portable; it does not grant permission to republish it.
          Keep attribution and source links with study notes, follow YouTube&apos;s
          applicable terms, and check copyright requirements before sharing substantial
          transcript material. Sonnetra preserves available text to make it more usable,
          not to claim ownership or guarantee a particular language is available.
        </p>
        <p>
          Read more about <Link href="/youtube-transcript-amharic">Amharic transcript availability</Link>,
          or <Link href="/#workspace">try the real transcript workflow</Link> with a source
          that has captions in the language you want.
        </p>
      </article>
    </PublicPageShell>
  );
}
