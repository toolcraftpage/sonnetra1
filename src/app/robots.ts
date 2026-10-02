import type { MetadataRoute } from "next";

import { getPublicConfig } from "@/lib/config/public";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${getPublicConfig().appUrl}/sitemap.xml`,
  };
}