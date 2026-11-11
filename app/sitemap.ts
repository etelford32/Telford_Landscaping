import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteConfig";
import { serviceAreas } from "@/lib/serviceAreas";

/**
 * The public marketing pages, for search engines. The design app, account
 * pages, and admin are left out on purpose. Add a new page here when you add
 * its route; city pages are picked up from lib/serviceAreas.ts automatically.
 */
const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/portfolio", priority: 0.9 },
  { path: "/drainage-trenching", priority: 0.8 },
  { path: "/fire-wise-landscaping", priority: 0.8 },
  { path: "/water-smart-landscaping", priority: 0.8 },
  { path: "/native-low-maintenance", priority: 0.8 },
  { path: "/irrigation", priority: 0.8 },
  { path: "/fertilization", priority: 0.7 },
  { path: "/plant-care", priority: 0.7 },
  { path: "/for-contractors", priority: 0.7 },
  { path: "/plants", priority: 0.4 },
  { path: "/privacy", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p.path === "/" ? "" : p.path}`, priority: p.priority })),
    ...serviceAreas.map((a) => ({ url: `${siteUrl}/${a.slug}`, priority: 0.9 })),
  ];
}
