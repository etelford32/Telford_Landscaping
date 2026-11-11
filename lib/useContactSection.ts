"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Ids of the contact section on each marketing page. A page has at most one.
 * Add the id here when a new page gets its own contact section.
 */
export const CONTACT_SECTIONS = ["contact", "portfolio-contact", "bid", "send-plans"];

/**
 * The id of the current page's own request form, or null if it has none.
 *
 * "Free Estimate" buttons in the header and the phone call bar use this to
 * scroll to the form on the page the visitor is already reading — which is
 * tagged with that page's service and city — instead of bouncing them to the
 * homepage. A section only counts if it actually holds a form (the privacy
 * page's "Contact us" section, for one, does not).
 */
export function useContactSection(): string | null {
  const pathname = usePathname();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setId(CONTACT_SECTIONS.find((s) => document.getElementById(s)?.querySelector("form")) ?? null);
  }, [pathname]);

  return id;
}
