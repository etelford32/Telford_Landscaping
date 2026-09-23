# Analytics & Lead Delivery

How visitors are measured on their way to a consultation request, and how each request reaches the inbox.

Both depend on environment variables in Vercel (Project → Settings → Environment Variables). **Until they are set, GA does not load and the lead forms can't send.** When a form can't send, it asks the visitor to call or email instead of pretending the request went through.

| Variable | Environments | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Production only | GA4 measurement ID (`G-…`). Baked in at build, so redeploy after setting it. |
| `RESEND_API_KEY` | Production + Preview | Sends each lead by email through Resend. |
| `LEAD_EMAIL_TO` | optional | Inbox for leads. Default: `siteConfig.email` (etelford32@gmail.com). |
| `LEAD_EMAIL_FROM` | optional | Sender. Default `Telford Landscaping <onboarding@resend.dev>`. |

---

## 1. Lead emails (Resend)

Every lead form posts to `/api/contact/lead`: the homepage, the portfolio, and the fire-wise, water-smart and native pages. The logged-in plant-care form posts to `/api/contact/plant-care`. Both routes validate the request and email it through Resend (`lib/email.ts`, `lib/leads.ts`).

Each email contains:

- **Contact details:** name, phone, email, city, which form it came from, and when (Pacific time). Phone and email are tap-to-call and tap-to-email links.
- **Reply-To set to the prospect,** so hitting Reply answers them directly.
- **"How they found the site":** the first landing page, referrer, UTM campaign and ad click IDs (for example a Google Ads `gclid`), and the page they submitted from.
- **Spam flag:** if the hidden honeypot field is filled in (usually a bot), the subject is prefixed with `[possible spam]`. The lead is flagged, never dropped.

The visitor only sees "Request received" after Resend has accepted the email. If delivery fails, they're asked to call or text, and the full lead is written to the Vercel runtime log (`[lead] email delivery failed…`) so it can still be recovered.

### Setup

1. In Resend, go to **API Keys → Create API key** (sending access is enough).
2. In Vercel, add `RESEND_API_KEY` for Production and Preview, then redeploy.
3. Submit a test through the live form and check that it arrives in Gmail. **Resend → Emails** shows the delivery log.
4. **Recommended:** in Resend, go to **Domains → Add domain** and add `telfordlandscaping.com`, then add the DNS records it lists. Once verified, set `LEAD_EMAIL_FROM="Telford Landscaping <leads@telfordlandscaping.com>"`. Until then, the default `onboarding@resend.dev` sender can only deliver to the email address that owns the Resend account.

Local dev without a key prints the email to the terminal instead of sending it.

---

## 2. Google Analytics 4

`components/GoogleAnalytics.tsx` loads gtag.js. GA4's enhanced measurement records page views, including client-side navigations. The site sends no page views of its own, because that would double count.

### Setup

1. **Create a GA4 property for this site.** Keep it separate from the Explore the Universe 2175 property so the reports don't mix. Add a **Web** data stream for `https://www.telfordlandscaping.com` and copy its Measurement ID (`G-…`).
2. **Set `NEXT_PUBLIC_GA_MEASUREMENT_ID`** in Vercel (Production only) and redeploy. To check it: view the page source on the live site and look for `googletagmanager.com/gtag/js?id=G-…`, then watch **Reports → Realtime** while you click around.
3. **Enhanced measurement** (Data stream → Enhanced measurement): keep *Page views → page changes based on browser history events* **on**. Turn *Form interactions* **off**, since the site's own `lead_form_*` events replace it.
4. **Key events** (Admin → Key events → New key event): add `generate_lead` and `contact_click`.
5. **Custom dimensions** (Admin → Custom definitions → Create, all event-scoped): `cta_id`, `cta_location`, `method`, `service`, `error_type`, `lead_city`. Without these, the parameters are collected but can't be used in reports.
6. **Exclude your own visits** (Admin → Data streams → Configure tag settings → Define internal traffic): add your home IP, then activate the *Internal Traffic* filter under Admin → Data filters.

### Events

| Event | When | Parameters |
| --- | --- | --- |
| `page_view` | Every page, sent by GA | source / medium / campaign (automatic) |
| `cta_click` | Any element with `data-cta` | `cta_id`, `cta_location`, `link_url` |
| `select_content` | Homepage California tab chosen | `content_type=california_tab`, `content_id` |
| `lead_form_view` | Form is 40% on screen (once per page) | `service` |
| `lead_form_start` | First focus in the form | `service` |
| `lead_form_submit` | Submit pressed | `service` |
| **`generate_lead`** | Server accepted and emailed the lead | `service`, `lead_city` |
| `lead_form_error` | Submit failed | `service`, `error_type` (`validation` / `server` / `network`) |
| **`contact_click`** | Any `tel:` or `mailto:` link, anywhere | `method` (`phone` / `email`), `cta_location` |
| `portfolio_project_view` | Portfolio lightbox opened | `project` |

`service` identifies which form was used, for example `Homepage — consultation request` or `Fire-Wise / Defensible Space`. No names, emails or phone numbers are sent to GA, which its terms forbid.

### Funnel report

Go to **Explore → Funnel exploration** and set it up as an open funnel with these steps:

1. **Landed:** `session_start`
2. **Showed intent:** `cta_click` *or* `lead_form_view`
3. **Started form:** `lead_form_start`
4. **Submitted:** `lead_form_submit`
5. **Lead:** `generate_lead`

Useful breakdowns are *Session source / medium* (which traffic converts), *Landing page + query string* (which entry page works) and `service` (which form placement works). The biggest drop-off between steps is the one to work on next.

Phone and email are a separate path. Build a free-form exploration of `contact_click` by `method` × `cta_location` to see which buttons get people to call.

### Tagging new CTAs

No code is needed, only attributes:

- Every `tel:` and `mailto:` link is tracked automatically.
- For a button or link that should count as intent, add `data-cta="some-id"`.
- `data-cta-location="…"` on the link, or on any section around it, sets where the click is reported as coming from.
