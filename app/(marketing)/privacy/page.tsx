import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/siteConfig";

/*
 * Plain-language privacy policy. It describes what the site actually does —
 * keep it in step with the code: lead forms (lib/leads.ts, lib/email.ts via
 * Resend), Google Analytics (components/GoogleAnalytics.tsx, lib/analytics.ts),
 * browser storage, and accounts (lib/userStorage.ts). Adding a new tracker,
 * newsletter, CRM, or ad platform means updating this page and EFFECTIVE_DATE.
 */
const EFFECTIVE_DATE = "September 23, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy | Telford Landscaping",
  description:
    "How Telford Landscaping (Telford Projects LLC) collects, uses, and protects information from visitors and clients, including Google Analytics and consultation requests.",
  alternates: { canonical: "/privacy" },
};

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-earth-200 pt-9 mt-9 first:border-0 first:pt-0 first:mt-0">
      <h2 className="text-[22px] font-bold tracking-tight text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4 text-[16px] leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

function List({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2 marker:text-primary-600">{children}</ul>;
}

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="text-primary-700 font-semibold underline underline-offset-2 hover:text-primary-800">
    {children}
  </a>
);

const contents = [
  ["collect", "What we collect"],
  ["use", "How we use it"],
  ["share", "Who we share it with"],
  ["analytics", "Google Analytics, cookies & browser storage"],
  ["retention", "How long we keep it"],
  ["choices", "Your choices and rights"],
  ["california", "California privacy rights"],
  ["other", "Children, security & changes"],
  ["contact", "Contact us"],
] as const;

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <header className="bg-gradient-to-br from-primary-800 via-primary-900 to-earth-900 text-white">
        <div className="max-w-3xl mx-auto px-6 pt-14 pb-12 lg:pt-20 lg:pb-16">
          <div className="text-[12.5px] font-bold tracking-[0.22em] uppercase text-primary-300 mb-4">
            {siteConfig.legalName}
          </div>
          <h1 className="text-[clamp(31px,3.8vw,44px)] font-extrabold tracking-tight leading-[1.13] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[16.5px] text-primary-100/90 leading-relaxed max-w-[58ch]">
            The short version: we collect what you send us when you ask for a consultation, we use
            Google Analytics to see how the site is used, and we never sell your information.
          </p>
          <p className="mt-5 text-[13px] text-primary-200/80 font-medium">Effective {EFFECTIVE_DATE}</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        <p className="text-[16px] leading-relaxed text-gray-700 mb-8">
          {siteConfig.legalName}, doing business as {siteConfig.name} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;), runs {siteConfig.domain}. This policy explains what information we collect
          when you use the site or contact us, why, who else handles it, and the choices you have.
        </p>

        <nav aria-label="On this page" className="rounded-2xl border-2 border-earth-200 bg-earth-50 px-6 py-5 mb-12">
          <div className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-3">On this page</div>
          <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[15px]">
            {contents.map(([id, label], i) => (
              <li key={id}>
                <a href={`#${id}`} className="text-primary-800 hover:underline">
                  {i + 1}. {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Section id="collect" title="1. What we collect">
          <p>
            <strong className="text-gray-900">Information you give us.</strong> When you request a
            consultation, bid, or estimate, we collect your name, phone number, email address, city,
            and whatever you tell us about the property and project. If you call, text, or email us
            directly, we receive whatever you choose to share.
          </p>
          <p>
            <strong className="text-gray-900">How you found us.</strong> Along with a request, the form
            sends the page you submitted it from and a short note of how you first arrived: the first
            page you landed on, the site that referred you (for example, a search engine), campaign tags
            in the link (such as <code className="text-[14px]">utm_source</code>), and ad click
            identifiers (such as Google&rsquo;s <code className="text-[14px]">gclid</code>). This tells
            us which of our efforts are working. It is only sent if you submit a request.
          </p>
          <p>
            <strong className="text-gray-900">Accounts.</strong> If you create an account (used for the
            design tool and plant-care requests), we collect your name, email address, and password. The
            password is stored only in scrambled (hashed) form. Signed-in plant-care requests also include
            your property size and the service you&rsquo;re asking about.
          </p>
          <p>
            <strong className="text-gray-900">Usage information.</strong> Google Analytics and our
            hosting provider collect information automatically when you visit. See{" "}
            <a href="#analytics" className="text-primary-700 underline underline-offset-2">section 4</a>.
          </p>
          <p>
            We don&rsquo;t ask for payment details, Social Security numbers, or other sensitive personal
            information through this site.
          </p>
        </Section>

        <Section id="use" title="2. How we use it">
          <List>
            <li>To respond to your request, visit the property, prepare a bid, and plan, perform, and warranty the work.</li>
            <li>To communicate with you about your project. We contact you about your request or project, not with unrelated marketing.</li>
            <li>To understand which pages, services, and marketing bring people to us, so we can improve the site.</li>
            <li>To keep the site secure and working, and to filter spam and abuse.</li>
            <li>To keep business, tax, licensing, and warranty records, and to meet legal obligations.</li>
          </List>
        </Section>

        <Section id="share" title="3. Who we share it with">
          <p>
            We don&rsquo;t sell your personal information, and we don&rsquo;t share it for cross-context
            behavioral advertising. We rely on a few service providers who handle information on our
            behalf and only to provide their service to us:
          </p>
          <List>
            <li>
              <strong className="text-gray-900">Resend</strong> delivers consultation requests from the
              site to our inbox.
            </li>
            <li>
              <strong className="text-gray-900">Google</strong> provides our email (Gmail) and Google
              Analytics.
            </li>
            <li>
              <strong className="text-gray-900">Vercel</strong> hosts the website and keeps standard
              server logs.
            </li>
          </List>
          <p>
            We may also disclose information if the law requires it, to protect our rights or the safety
            of others, or to a successor if the business is ever sold or reorganized. In that case, this
            policy would continue to apply to your information.
          </p>
        </Section>

        <Section id="analytics" title="4. Google Analytics, cookies & browser storage">
          <p>
            <strong className="text-gray-900">Google Analytics.</strong> We use Google Analytics to
            measure how the site is used. It records things like the pages you view, how you arrived, your
            device and browser type, your approximate location (city level), and interactions such as
            clicking a call button or starting and submitting a form. It uses first-party cookies (
            <code className="text-[14px]">_ga</code> and <code className="text-[14px]">_ga_*</code>) that
            last up to two years. We use it for measurement only, not advertising. We never send your name,
            email, phone number, or message to Google Analytics. Google processes this data under its own
            terms. See{" "}
            <A href="https://policies.google.com/technologies/partner-sites">
              how Google uses information from sites that use its services
            </A>
            .
          </p>
          <p>
            Other than Google Analytics as described here, we don&rsquo;t allow third parties to collect
            information about your activity on this site over time or across other websites.
          </p>
          <p>
            <strong className="text-gray-900">Browser storage.</strong> The site also saves a few items
            in your own browser:
          </p>
          <List>
            <li>The note of how you first arrived, described in section 1. A new one replaces it after 90 days.</li>
            <li>Designs you save in the design tool, and preferences such as whether you&rsquo;ve closed the tutorial. These stay on your device.</li>
            <li>A sign-in cookie, if you create an account or log in. It lasts seven days or until you log out.</li>
          </List>
          <p>
            <strong className="text-gray-900">Server logs.</strong> Like any website, our host
            automatically records technical details of each request, such as IP address, browser, and the
            page requested. These are used to run and secure the site.
          </p>
        </Section>

        <Section id="retention" title="5. How long we keep it">
          <p>
            We keep consultation requests and project correspondence for as long as we need them to
            respond, do the work, and stand behind it. That includes warranty, tax, and contractor-licensing
            records, which can mean several years for clients whose projects we build. If we don&rsquo;t end
            up working together, you can ask us to delete your request at any time.
          </p>
          <p>
            Google Analytics data is kept for no longer than 14 months. Our host keeps server logs for
            a short period under its own retention policy.
          </p>
        </Section>

        <Section id="choices" title="6. Your choices and rights">
          <List>
            <li>
              <strong className="text-gray-900">Review, correct, or delete.</strong> Ask us for a copy of
              the personal information we hold about you, or ask us to correct or delete it. Contact us
              using the details in{" "}
              <a href="#contact" className="text-primary-700 underline underline-offset-2">section 9</a>.
            </li>
            <li>
              <strong className="text-gray-900">Opt out of Google Analytics.</strong> Install Google&rsquo;s{" "}
              <A href="https://tools.google.com/dlpage/gaoptout">Analytics opt-out browser add-on</A>, or
              block or clear cookies in your browser settings. The site works either way.
            </li>
            <li>
              <strong className="text-gray-900">Clear browser storage.</strong> Clearing this site&rsquo;s
              data in your browser removes the arrival note, saved designs, and sign-in cookie.
            </li>
            <li>
              <strong className="text-gray-900">Do Not Track.</strong> The site doesn&rsquo;t currently
              respond to &ldquo;Do Not Track&rdquo; browser signals. Because we don&rsquo;t sell or share
              personal information, there is nothing for a Global Privacy Control signal to opt you out of.
            </li>
          </List>
        </Section>

        <Section id="california" title="7. California privacy rights">
          <p>
            If you live in California, you have the right to know what personal information we collect,
            use, and disclose, and to ask us to delete or correct it. You also have the right not to be
            treated differently for using these rights. As explained above, we don&rsquo;t sell or share
            personal information and we don&rsquo;t use sensitive personal information, so there is
            nothing to opt out of.
          </p>
          <p>
            To make a request, email or call us. We&rsquo;ll confirm it&rsquo;s you by matching the
            contact details we already have, and we&rsquo;ll respond within 45 days. An authorized agent
            may also make a request on your behalf with your written permission.
          </p>
          <p>
            Under California&rsquo;s &ldquo;Shine the Light&rdquo; law, you may ask whether we&rsquo;ve
            shared personal information with third parties for their own direct marketing. We
            haven&rsquo;t.
          </p>
        </Section>

        <Section id="other" title="8. Children, security & changes">
          <p>
            <strong className="text-gray-900">Children.</strong> This site is for homeowners and property
            managers. It isn&rsquo;t directed to children under 16, and we don&rsquo;t knowingly collect
            their personal information. If you think a child has sent us information, contact us and
            we&rsquo;ll delete it.
          </p>
          <p>
            <strong className="text-gray-900">Security.</strong> The site is served only over encrypted
            HTTPS. We limit who can access requests and use reputable providers. No method of transmission
            or storage is completely secure, but we take reasonable care to protect your information.
          </p>
          <p>
            <strong className="text-gray-900">Changes.</strong> If we change this policy, we&rsquo;ll post
            the new version here and update the effective date at the top. If the change is significant,
            we&rsquo;ll say so clearly on this page.
          </p>
        </Section>

        <Section id="contact" title="9. Contact us">
          <p>Questions, requests, or concerns about your privacy:</p>
          <div className="rounded-2xl border-2 border-earth-200 bg-gradient-to-br from-primary-50/60 to-earth-50 px-6 py-5 text-[15.5px] leading-[1.9]">
            <div className="font-bold text-gray-900">{siteConfig.legalName}</div>
            <div>
              Email: <A href={`mailto:${siteConfig.email}?subject=Privacy%20request`}>{siteConfig.email}</A>
            </div>
            <div>
              Phone: <A href={siteConfig.phoneHref}>{siteConfig.phone}</A>
            </div>
            <div className="text-gray-500 text-[14px]">
              {siteConfig.license} · Serving the Sacramento foothills, California
            </div>
          </div>
          <p className="pt-2">
            <Link href="/" className="text-primary-700 font-semibold hover:underline">
              ← Back to {siteConfig.name}
            </Link>
          </p>
        </Section>
      </div>
    </div>
  );
}
