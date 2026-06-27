// Centralized Google Analytics (GA4) helpers.
//
// All analytics calls funnel through here so we have one typed surface for
// tracking instead of scattered `(window as any).gtag(...)` calls. If GA isn't
// configured (no NEXT_PUBLIC_GA_MEASUREMENT_ID) or gtag hasn't loaded yet,
// every call is a safe no-op.

type GtagFn = (
  command: 'config' | 'event' | 'js' | 'set',
  targetOrName: string | Date,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

/** True when running in the browser with gtag available. */
function gtagReady(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Fire a GA4 event. Safe to call anywhere — no-ops when analytics is disabled.
 *
 * @param name   GA4 event name (e.g. 'generate_lead', 'sign_up').
 * @param params Optional event parameters.
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!gtagReady()) return;
  window.gtag!('event', name, params);
}

/**
 * Track a page view. Called by the GoogleAnalytics component on route changes.
 */
export function trackPageView(measurementId: string, path: string): void {
  if (!gtagReady()) return;
  window.gtag!('config', measurementId, { page_path: path });
}

// ── Named funnel events for the new-customer journey ──
//
// Using named helpers (rather than raw strings at the call site) keeps event
// names and parameter shapes consistent across the app, which is what makes
// the GA4 funnel reports reliable.

/** A visitor clicked a primary call-to-action. */
export function trackCtaClick(ctaId: string, location: string): void {
  trackEvent('cta_click', { cta_id: ctaId, cta_location: location });
}

/** A visitor submitted a lead/consultation form. Maps to GA4 'generate_lead'. */
export function trackLead(formName: string, params: Record<string, unknown> = {}): void {
  trackEvent('generate_lead', { form_name: formName, ...params });
}

/** A visitor created an account. Maps to GA4 recommended 'sign_up' event. */
export function trackSignUp(method = 'email'): void {
  trackEvent('sign_up', { method });
}

/** A visitor opened the 3D design tool — a key activation step. */
export function trackDesignToolOpened(source: string): void {
  trackEvent('design_tool_opened', { source });
}
