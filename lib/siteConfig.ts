/**
 * Single source of truth for business contact + identity details.
 * Update these in one place and every page/component picks it up.
 */
export const siteConfig = {
  name: "Telford Landscaping",
  legalName: "Telford Projects LLC",
  license: "CA C-27 Lic. #1156976",
  domain: "telfordlandscaping.com",

  // Contact — displayed across the homepage, lead pages, nav, and footer.
  phone: "(279) 227-6372",
  phoneHref: "tel:+12792276372",
  email: "etelford32@gmail.com",

  // Service area, in order of emphasis.
  cities: ["Granite Bay", "Loomis", "Auburn", "Roseville", "Lincoln"],
} as const;

/**
 * Canonical origin, used for metadataBase, canonical URLs, and structured
 * data. NEXT_PUBLIC_SITE_URL overrides it on preview deployments; nothing
 * else should hard-code the domain.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${siteConfig.domain}`;

export type SiteConfig = typeof siteConfig;
