import Script from "next/script";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Loads GA4 (gtag.js) for siteConfig.gaMeasurementId.
 *
 * Hits are only sent from the live domain. On preview deployments,
 * *.vercel.app, and local builds the tag loads but is never configured, so
 * nothing reaches GA — while funnel events still collect in window.dataLayer,
 * which is handy for checking them in the browser console.
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
export default function GoogleAnalytics() {
  const id = siteConfig.gaMeasurementId;
  const liveHosts = JSON.stringify([siteConfig.domain, `www.${siteConfig.domain}`]);

  return (
    <>
      <Script id="google-analytics" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
if (${liveHosts}.indexOf(location.hostname) !== -1) gtag('config', '${id}');`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
    </>
  );
}
