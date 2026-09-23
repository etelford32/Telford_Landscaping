"use client";

import { useEffect } from "react";
import { captureAttribution, trackClick } from "@/lib/analytics";

/**
 * Mounted once in the root layout. Records first-touch attribution and
 * installs the single document-level click listener that turns tel:/mailto:
 * links and data-cta elements into funnel events (see lib/analytics.ts).
 */
export default function FunnelTracker() {
  useEffect(() => {
    captureAttribution();
    const onClick = (e: MouseEvent) => trackClick(e.target);
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
