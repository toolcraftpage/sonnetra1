import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Plans and pricing",
  description:
    "See the current status of Sonnetra plans. Paid plans and bulk transcript downloads are not available yet.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Sonnetra plans and pricing",
    description:
      "Learn which Sonnetra transcript features are available today and what is still in development.",
    url: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <PublicPageShell
      title="Plans and pricing"
      intro="Sonnetra is still developing its plan structure. There are no paid plans or bulk-download features available for purchase at this time."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <p className="eyebrow">Available now</p>
            <h2>Transcript workspace</h2>
            <p>
              Use the current YouTube transcript workflow to submit a supported video,
              review available text, search within it, and use the export options shown
              in the transcript reader. Retrieval depends on captions and provider
              availability.
            </p>
            <Link href="/#workspace" className="primary-action">Try the transcript tool</Link>
          </article>
          <article className="page-card">
            <p className="eyebrow">Coming soon</p>
            <h2>Bulk transcript downloads</h2>
            <p>
              We are exploring a Pro workflow for managing multiple transcripts.
              Bulk downloading and paid plans are not enabled, and no future price or
              release date is being promised here.
            </p>
            <a
              href="mailto:hello@sonnetra.app?subject=Sonnetra%20plan%20interest"
              className="secondary-link"
            >
              Share feature interest by email
            </a>
          </article>
        </div>
      </section>
    </PublicPageShell>
  );
}
