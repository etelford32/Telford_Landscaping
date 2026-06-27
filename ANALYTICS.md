# Analytics

The site uses **Google Analytics 4 (GA4)** to measure traffic and the
new-customer acquisition funnel.

## Activating analytics

Analytics is **off until a measurement ID is configured**. Every tracking call
is a safe no-op when the ID is missing, so nothing breaks in local dev.

To turn it on:

1. Create a GA4 property at <https://analytics.google.com> and copy its
   measurement ID (looks like `G-XXXXXXXXXX`, under **Admin → Data Streams**).
2. Set it in your environment:

   ```bash
   # .env.local (local) or your hosting provider's env settings (e.g. Vercel)
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. Restart / redeploy. Page views and the events below will start flowing.

> The variable is prefixed `NEXT_PUBLIC_` so it's available in the browser. That
> is expected for GA4 — the measurement ID is not a secret.

## How it's wired

- **`components/GoogleAnalytics.tsx`** — loads the gtag script and fires a page
  view on every client-side route change. Mounted once in `app/layout.tsx`.
- **`lib/analytics.ts`** — the single typed surface for all tracking. Call these
  helpers instead of touching `window.gtag` directly.

## Tracked events

| Event                  | Fires when…                                       | Where |
| ---------------------- | ------------------------------------------------- | ----- |
| `page_view`            | any client-side navigation                        | `GoogleAnalytics.tsx` |
| `cta_click`            | a primary CTA is clicked (`cta_id`, `cta_location`) | `TrackedLink` on the homepage |
| `generate_lead`        | a consultation form is submitted (`form_name`)    | homepage contact form, plant-care form |
| `sign_up`              | an account is created (`method`)                  | `/signup` |
| `design_tool_opened`   | helper available for the 3D tool activation step  | `lib/analytics.ts` (`trackDesignToolOpened`) |

`generate_lead` and `sign_up` are GA4 recommended event names, so they map
cleanly to conversions in the GA4 UI.

## The new-customer funnel

The intended funnel, top to bottom:

1. `page_view` — visitor lands on the marketing site
2. `cta_click` — engages with a primary CTA (e.g. opens the design tool)
3. `generate_lead` — submits the consultation form (the homepage form posts to
   `/api/contact`)
4. `sign_up` — creates an account

Mark `generate_lead` and `sign_up` as conversions in GA4
(**Admin → Events → mark as key event**) to see conversion rates and drop-off.

## Adding a new event

Add a named helper to `lib/analytics.ts` and call it from the relevant
component — don't scatter raw `window.gtag` calls, so event names and parameter
shapes stay consistent across the app.

## Verifying

With the measurement ID set, open GA4 **Realtime** (or use the GA Debug View /
the [GA Debugger](https://chrome.google.com/webstore) extension), click around
the site, submit the contact form, and confirm the events appear.
