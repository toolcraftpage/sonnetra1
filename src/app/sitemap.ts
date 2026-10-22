import type { MetadataRoute } from "next";

import { getPublicConfig } from "@/lib/config/public";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getPublicConfig().appUrl;

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/youtube-transcript`, lastModified: new Date() },
    { url: `${baseUrl}/youtube-transcript-generator`, lastModified: new Date() },
    { url: `${baseUrl}/youtube-transcript-extractor`, lastModified: new Date() },
    { url: `${baseUrl}/youtube-transcript-with-timestamps`, lastModified: new Date() },
    { url: `${baseUrl}/youtube-subtitles-to-text`, lastModified: new Date() },
    { url: `${baseUrl}/youtube-transcript-downloader`, lastModified: new Date() },
    { url: `${baseUrl}/youtube-transcript-amharic`, lastModified: new Date() },
    { url: `${baseUrl}/how-to-get-youtube-transcript`, lastModified: new Date() },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date() },
    { url: `${baseUrl}/features`, lastModified: new Date() },
    { url: `${baseUrl}/faq`, lastModified: new Date() },
    { url: `${baseUrl}/guides`, lastModified: new Date() },
    { url: `${baseUrl}/guides/how-to-get-youtube-transcript`, lastModified: new Date() },
    { url: `${baseUrl}/guides/how-to-copy-youtube-transcript`, lastModified: new Date() },
    { url: `${baseUrl}/guides/how-to-download-youtube-subtitles`, lastModified: new Date() },
    { url: `${baseUrl}/guides/youtube-transcripts-for-study`, lastModified: new Date() },
    { url: `${baseUrl}/guides/youtube-transcripts-for-research`, lastModified: new Date() },
    { url: `${baseUrl}/guides/youtube-transcript-timestamps`, lastModified: new Date() },
    { url: `${baseUrl}/guides/youtube-transcript-amharic`, lastModified: new Date() },
    { url: `${baseUrl}/guides/extract-amharic-transcripts-language-learning`, lastModified: new Date() },
    { url: `${baseUrl}/guides/ethics-youtube-transcripts-research`, lastModified: new Date() },
    { url: `${baseUrl}/guides/unicode-and-language-codes`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/pricing`, lastModified: new Date() },
  ];
}