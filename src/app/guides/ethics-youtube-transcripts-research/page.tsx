import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "The Ethics of Using YouTube Transcripts for Research",
  description:
    "A research ethics guide to YouTube transcripts, consent, context, citation, copyright, privacy, and responsible data handling.",
  alternates: { canonical: "/guides/ethics-youtube-transcripts-research" },
  openGraph: {
    title: "The Ethics of Using YouTube Transcripts for Research",
    description:
      "Practical considerations for citing and analyzing video transcripts responsibly.",
    url: "/guides/ethics-youtube-transcripts-research",
  },
};

export default function EthicsYouTubeTranscriptsResearchGuide() {
  return (
    <PublicPageShell
      title="The Ethics of Using YouTube Transcripts for Research"
      intro="A transcript makes spoken material easier to search, but access to text does not settle questions of consent, privacy, accuracy, or reuse. Consider these issues before collecting or publishing transcript data."
    >
      <article className="page-section guide-copy">
        <h2>Start with a clear research purpose</h2>
        <p>
          Before extracting a transcript, write down what question it helps you answer
          and why a transcript is needed rather than only viewing the recording. A defined
          purpose helps limit collection to relevant material and discourages retaining
          large volumes of text simply because the tool makes it easy. Follow your
          institution&apos;s research ethics process, supervisor guidance, and any legal
          or professional standards that apply. This article is general information, not
          a substitute for an ethics review or legal advice.
        </p>
        <p>
          If your work involves human participants, sensitive topics, private groups, or
          identifiable personal information, treat the transcript as potentially sensitive
          even when the video is publicly viewable. Public availability is not the same as
          informed consent for every type of analysis, quotation, aggregation, or
          redistribution. Consider whether a creator or speaker could reasonably be
          identified from a short quotation, a name, or a distinctive event. Ask your
          review board or ethics committee how consent and risk should be assessed for
          your specific project.
        </p>

        <h2>Check provenance and accuracy</h2>
        <p>
          A generated or supplied transcript is a representation of speech, not the
          recording itself. Captions can omit words, misrecognize names, merge speakers,
          flatten turn-taking, or lose nonverbal meaning. Language labels and timestamps
          may also be incomplete. When a passage matters to your analysis, return to the
          video, listen to the surrounding context, and record how you verified the
          quotation. Keep the source URL, video title, retrieval date, and transcript
          language in your research notes so another reader can understand where the text
          came from.
        </p>
        <p>
          Sonnetra can help retrieve available text, preserve source language and timing
          information when supplied, and search within a result. It does not certify the
          accuracy of captions, validate a speaker&apos;s claims, or turn a transcript
          into an authoritative record. For a practical workflow, submit a supported URL
          using the <Link href="/#workspace">transcript tool</Link>, then check important
          passages in the original recording.
        </p>

        <h2>Cite the source and preserve context</h2>
        <p>
          Cite the video according to the style required by your discipline, and include
          enough detail for readers to find the original material. Distinguish words
          spoken in the video from text supplied by captions or automated recognition.
          Use quotation marks accurately, note omissions, and avoid editing a passage in
          ways that change its meaning. When timing is available, a timestamp can help
          reviewers locate the relevant moment. When timing is not available, include
          other stable identifying details and explain any limits on locating the passage.
        </p>
        <p>
          Context includes the speaker&apos;s language, audience, format, and the
          surrounding conversation. A clipped sentence can give an unfair impression,
          especially in interviews or discussions involving contested views. Be careful
          with dialect, translation, irony, and culturally specific terms. If you translate
          or normalize a quotation, retain the original-language text where appropriate
          and clearly describe what editorial steps you took.
        </p>

        <h2>Respect copyright and platform rules</h2>
        <p>
          Extracting text does not grant ownership of the transcript or permission to
          reproduce it. A video may contain copyrighted scripts, lectures, music lyrics,
          or other protected work. Research exceptions and quotation rules differ by
          jurisdiction and context; consult your institution or qualified counsel when
          substantial text will be shared or published. Follow YouTube&apos;s Terms of
          Service and the creator&apos;s applicable license. Prefer short, necessary
          quotations with clear attribution over republishing an entire transcript.
        </p>
        <p>
          These principles apply even if a transcript can be copied or exported with one
          click. Ease of access is not a rights clearance. Do not bypass access controls,
          scrape beyond permitted use, or make private transcript access links public.
        </p>

        <h2>Minimize and protect research data</h2>
        <p>
          Retain only the material needed for your project, restrict access to working
          files, and follow your approved retention schedule. Remove personal information
          that is not necessary, and assess whether quoted passages could identify someone
          after names are removed. If you use a cloud tool or external transcript provider,
          review what source information is sent and whether the service fits your
          institution&apos;s requirements. Keep access tokens confidential and avoid
          placing sensitive transcript material in shared or public repositories.
        </p>
        <p>
          Responsible transcript research combines accurate source checking with
          thoughtful consent, citation, rights review, and data minimization. Use the
          <Link href="/#workspace">Sonnetra tool</Link> as one part of that process, not as
          a replacement for research judgment.
        </p>
      </article>
    </PublicPageShell>
  );
}
