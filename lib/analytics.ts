/**
 * Funnel measurement for the marketing site. Everything here no-ops when GA
 * isn't configured, so callers never have to guard.
 *
 * The funnel, in order (see ANALYTICS.md for the GA setup that reads it):
 *
 *   page_view         landing — sent by GA itself, with source/medium
 *   cta_click         clicked a "request a bid / consultation" style CTA
 *   lead_form_view    the consultation form scrolled into view
 *   lead_form_start   first interaction with a form field
 *   lead_form_submit  pressed submit
 *   generate_lead     server accepted the lead and emailed it   ← key event
 *   lead_form_error   submit failed (validation / server / network)
 *
 * Alongside it, contact_click (method: phone | email) records the people who
 * skip the form and call or email directly — also a key event.
 */
type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", name, params);
}

/**
 * Where on the page a click came from: the nearest `data-cta-location`,
 * checked on the element itself first, then its ancestors (sections set it
 * once for everything inside them).
 */
function ctaLocation(el: Element): string {
  return el.closest<HTMLElement>("[data-cta-location]")?.dataset.ctaLocation ?? "unknown";
}

/**
 * Classifies a click anywhere on the page. Installed once as a document
 * listener by <FunnelTracker />, so no CTA has to wire up its own onClick:
 *
 * - every tel: / mailto: link  → contact_click { method, cta_location }
 * - anything with data-cta="…" → cta_click { cta_id, cta_location, link_url }
 */
export function trackClick(target: EventTarget | null): void {
  if (!(target instanceof Element)) return;
  const el = target.closest<HTMLElement>("a[href], [data-cta]");
  if (!el) return;

  const href = el.getAttribute("href") ?? "";
  const location = ctaLocation(el);

  if (href.startsWith("tel:")) {
    trackEvent("contact_click", { method: "phone", cta_location: location });
  } else if (href.startsWith("mailto:")) {
    trackEvent("contact_click", { method: "email", cta_location: location });
  } else if (el.dataset.cta) {
    trackEvent("cta_click", { cta_id: el.dataset.cta, cta_location: location, link_url: href || undefined });
  }
}

/* ── First-touch attribution ─────────────────────────────────────────────
 * GA owns the real attribution reporting. This keeps a copy of how a visitor
 * first arrived so it can ride along in the lead email — Elliot sees "came
 * from a Google search, landed on /fire-wise-landscaping" without opening GA.
 */

const ATTRIBUTION_KEY = "tl_attribution";
const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export const CAMPAIGN_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
] as const;

export type Attribution = {
  landing_page: string;
  referrer: string;
  first_seen: string;
} & Partial<Record<(typeof CAMPAIGN_PARAMS)[number], string>>;

export function getAttribution(): Attribution | null {
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/** Records this visit as the first touch, unless one younger than 90 days exists. */
export function captureAttribution(): void {
  try {
    const existing = getAttribution();
    if (existing && Date.now() - Date.parse(existing.first_seen) < ATTRIBUTION_TTL_MS) return;

    const { pathname, search } = window.location;
    const params = new URLSearchParams(search);
    const record: Attribution = {
      landing_page: pathname + search,
      referrer: document.referrer,
      first_seen: new Date().toISOString(),
    };
    for (const key of CAMPAIGN_PARAMS) {
      const value = params.get(key);
      if (value) record[key] = value;
    }
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked (private mode, disabled cookies) — attribution is a nicety.
  }
}
