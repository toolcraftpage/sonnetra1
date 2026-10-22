import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { getPublicConfig } from "@/lib/config/public";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicConfig().appUrl),
  title: {
    default: "Sonnetra | YouTube transcripts, made useful",
    template: "%s | Sonnetra",
  },
  description:
    "A focused workspace for complete, searchable YouTube transcripts with multilingual and Unicode support.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Sonnetra",
    title: "Sonnetra | YouTube transcripts, made useful",
    description:
      "A focused workspace for complete, searchable YouTube transcripts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sonnetra | YouTube transcripts, made useful",
    description:
      "A focused workspace for complete, searchable YouTube transcripts.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
