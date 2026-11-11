import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteConfig";

/** Everything is crawlable except the API and admin; points crawlers at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
