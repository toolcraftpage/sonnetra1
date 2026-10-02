import type { MetadataRoute } from "next";

import { getPublicConfig } from "@/lib/config/public";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: getPublicConfig().appUrl, lastModified: new Date() }];
}