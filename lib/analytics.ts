/**
 * Thin wrapper over the gtag call installed by <GoogleAnalytics />. No-ops
 * when analytics isn't configured, so callers never have to guard.
 */
type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", name, params);
}

/**
 * Records a call or email click as a conversion event. `context` says where on
 * the page it came from (hero, lightbox, sticky bar…) so the highest-earning
 * CTAs are identifiable in GA.
 */
export function trackContact(method: "phone" | "email", context: string): void {
  trackEvent("contact_click", { method, context });
}
