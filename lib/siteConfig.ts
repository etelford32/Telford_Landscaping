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

export type SiteConfig = typeof siteConfig;
