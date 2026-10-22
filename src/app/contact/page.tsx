import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Sonnetra for product questions, support, or transcript workflow inquiries.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Sonnetra",
    description: "Reach the Sonnetra team with product or workflow questions.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <PublicPageShell
      title="Contact Sonnetra"
      intro="If you have a question about the product, transcript workflow, or supported usage, use the contact information below."
    >
      <section className="page-section">
        <div className="page-grid two-column">
          <article className="page-card">
            <h2>Product questions</h2>
            <p>For general inquiries about transcript extraction, YouTube source handling, privacy, or product behavior, email the Sonnetra support address.</p>
            <p><strong>Email:</strong> <a href="mailto:hello@sonnetra.app">hello@sonnetra.app</a></p>
          </article>
          <article className="page-card">
            <h2>Workflow and support</h2>
            <p>Use the contact details to ask about transcript access, export formats, product limits, or account-related questions. The team can also help with troubleshooting and product feedback.</p>
            <p><strong>Hours:</strong> Support response times vary based on the configuration of the live service and current operational workload.</p>
          </article>
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Need help?</p>
          <h2>Start with the extraction workflow and reach out if you need guidance.</h2>
        </div>
        <Link href="/#workspace" className="primary-action">Try Sonnetra</Link>
      </section>
    </PublicPageShell>
  );
}
