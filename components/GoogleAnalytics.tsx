import Script from "next/script";

const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,}$/;

/**
 * Loads GA4 (gtag.js) when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 *
 * Only the initial config is sent here. Client-side route changes are
 * recorded by GA4's enhanced measurement ("Page changes based on browser
 * history events", on by default), so sending our own page_view per route
 * would double count every navigation.
 *
 * The gtag() stub is defined before hydration so funnel events fired early —
 * e.g. the lead form already in view on a /#contact deep link — queue in
 * dataLayer instead of being dropped while gtag.js is still downloading.
 */
export default function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  if (!measurementId) return null;
  if (!MEASUREMENT_ID_PATTERN.test(measurementId)) {
    console.warn(
      `[analytics] NEXT_PUBLIC_GA_MEASUREMENT_ID "${measurementId}" is not a GA4 measurement ID (G-XXXXXXX); GA is disabled.`
    );
    return null;
  }

  return (
    <>
      <Script id="google-analytics" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
