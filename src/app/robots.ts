import type { MetadataRoute } from "next";

import { getPublicConfig } from "@/lib/config/public";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/", "/login", "/signup", "/forgot-password", "/transcripts/", "/auth/", "/_next/"] },
    ],
    sitemap: `${getPublicConfig().appUrl}/sitemap.xml`,
  };
}