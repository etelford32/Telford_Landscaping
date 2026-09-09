import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Mail,
  ShieldCheck,
  Hammer,
  MessageSquare,
  ClipboardCheck,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { siteConfig, siteUrl } from "@/lib/siteConfig";
import { projects } from "@/lib/portfolio";
import { CallLink, EmailLink } from "@/components/ContactActions";
import PortfolioGallery from "@/components/portfolio/PortfolioGallery";
import StickyContactBar from "@/components/portfolio/StickyContactBar";
import BeforeAfterSlider from "@/components/home/BeforeAfterSlider";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: `Portfolio | Redwood Fences, Decks, Retaining Walls & Patios — ${siteConfig.name}`,
  description: `Real projects, real photos: custom redwood gates and fence lines, timber carports, decks, flagstone patios, and retaining walls across ${siteConfig.cities.join(", ")}. Call or text ${siteConfig.phone} for a free on-site estimate.`,
  keywords:
    "landscaping portfolio Granite Bay, redwood fence builder Loomis, custom gate Auburn CA, retaining wall contractor Roseville, flagstone patio Sacramento foothills, redwood deck builder Lincoln CA, timber carport, landscape contractor near me",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: `Our Work | ${siteConfig.name}`,
    description:
      "Custom redwood gates and fence lines, decks, timber structures, flagstone, and retaining walls — built by hand in the Sacramento foothills.",
    type: "website",
    url: `${siteUrl}/portfolio`,
    images: [
      {
        url: "/portfolio/redwood-archway-gate.jpg",
        width: 1600,
        height: 1200,
        alt: "Custom redwood archway gate with integrated low-voltage lighting",
      },
    ],
  },
};

/** Trust signals under the hero — reasons to pick up the phone, not slogans. */
const assurances = [
  { icon: ShieldCheck, label: siteConfig.license, sub: "Bonded & insured" },
  { icon: Hammer, label: "One crew, start to finish", sub: "No subbed-out carpentry" },
  { icon: ClipboardCheck, label: "Free on-site estimate", sub: "Written scope and price" },
  { icon: MessageSquare, label: "Reply within one business day", sub: "Call, text, or email" },
];

const steps = [
  {
    n: "1",
    title: "Call, text, or email",
    body: `Ring ${siteConfig.phone} or send a note to ${siteConfig.email}. Tell us the property and roughly what you want — photos help, but they aren't required.`,
  },
  {
    n: "2",
    title: "We walk the property",
    body: "Usually within a week. We look at grade, drainage, access, sun, and what's already there, then talk through what's actually worth building.",
  },
  {
    n: "3",
    title: "You get a written bid",
    body: "Scope, materials, and price in writing, so you can compare it honestly against anyone else's. No pressure and no obligation.",
  },
];

export default function PortfolioPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HomeAndConstructionBusiness",
        "@id": `${siteUrl}/#business`,
        name: siteConfig.name,
        legalName: siteConfig.legalName,
        url: siteUrl,
        telephone: siteConfig.phone,
        email: siteConfig.email,
        image: `${siteUrl}/portfolio/redwood-archway-gate.jpg`,
        areaServed: siteConfig.cities.map((city) => ({
          "@type": "City",
          name: `${city}, CA`,
        })),
        makesOffer: [
          "Custom redwood fencing and gates",
          "Decks and timber structures",
          "Retaining walls and grading",
          "Flagstone patios and stonework",
          "Low-voltage landscape lighting",
        ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
      },
      {
        "@type": "ImageGallery",
        name: `${siteConfig.name} — completed projects`,
        url: `${siteUrl}/portfolio`,
        associatedMedia: projects.map((p) => ({
          "@type": "ImageObject",
          contentUrl: `${siteUrl}${p.image}`,
          name: p.title,
          description: p.tagline,
        })),
      },
    ],
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <header className="bg-gradient-to-br from-primary-800 via-primary-900 to-earth-900 text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-center pt-14 pb-16 lg:pt-20 lg:pb-24">
          <div>
            <div className="text-[12.5px] font-bold tracking-[0.22em] uppercase text-primary-300 mb-5">
              Our Work · {siteConfig.cities.slice(0, 4).join(" · ")}
            </div>
            <h1 className="text-[clamp(31px,3.8vw,48px)] font-extrabold tracking-tight leading-[1.13] mb-5">
              Work you can walk up to and{" "}
              <span className="text-primary-300">put your hand on.</span>
            </h1>
            <p className="text-[17px] text-primary-100/90 mb-8 max-w-[46ch] leading-relaxed">
              Every photo below is our own crew&rsquo;s work — redwood gates and fence lines, decks,
              timber structures, flagstone, and retaining walls built across the Sacramento foothills.
              See something you want on your property? It takes one call.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <CallLink context="hero" variant="light" className="text-[16px] whitespace-nowrap">
                <Phone className="w-[18px] h-[18px] flex-shrink-0" /> Call or text {siteConfig.phone}
              </CallLink>
              <EmailLink
                context="hero"
                variant="bare"
                className="btn-3d btn-3d-dark inline-flex items-center justify-center gap-2.5 bg-white/10 border-[1.5px] border-white/25 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/15 text-[16px] whitespace-nowrap"
              >
                <Mail className="w-[18px] h-[18px] flex-shrink-0" /> Email us
              </EmailLink>
            </div>

            <p className="mt-6 text-[13px] text-primary-200/80 font-medium">
              {siteConfig.license} · Bonded &amp; insured · Free estimates ·{" "}
              <EmailLink context="hero-inline" variant="bare" className="underline hover:text-white">
                {siteConfig.email}
              </EmailLink>
            </p>
          </div>

          <div className="relative">
            <div className="frame-earth rotate-[0.6deg]">
              <Image
                src="/portfolio/redwood-archway-gate.jpg"
                alt="Custom Berco redwood archway gate with forged iron hardware and integrated low-voltage lighting"
                width={880}
                height={660}
                priority
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute left-2.5 sm:-left-3.5 bottom-5 bg-white border border-earth-200 rounded-xl px-[18px] py-3 shadow-[0_12px_28px_-14px_rgba(20,26,18,0.45)] text-[13px] font-semibold text-gray-900 leading-snug">
              Redwood archway &amp; fence line
              <span className="block text-[11.5px] font-medium text-gray-500">
                Hand-cut arch · integrated low-voltage lighting
              </span>
            </div>
          </div>
        </div>

        {/* Assurance strip */}
        <div className="border-t border-white/15 bg-primary-900/40">
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {assurances.map((a) => (
              <div key={a.label} className="flex items-start gap-2.5">
                <a.icon className="w-[18px] h-[18px] text-primary-300 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[13.5px] font-bold leading-snug">{a.label}</div>
                  <div className="text-[12px] text-primary-200/75 font-medium">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── GALLERY (filters + lightbox) ── */}
      <section aria-labelledby="gallery-heading">
        <div className="max-w-6xl mx-auto px-6 pt-14 lg:pt-16 text-center">
          <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
            Recent Projects
          </div>
          <h2
            id="gallery-heading"
            className="text-[clamp(27px,3.2vw,38px)] font-extrabold tracking-tight text-gray-900 mb-3.5"
          >
            Built by Hand, in the Foothills
          </h2>
          <p className="text-[16.5px] text-gray-600 max-w-2xl mx-auto">
            Tap any project for the full photo and how it was built. Carpentry, stonework, and
            grading are all in-house — one crew, one number to call.
          </p>
        </div>
        <div className="mt-10">
          <PortfolioGallery projects={projects} />
        </div>
      </section>

      {/* ── MID-PAGE CTA BAND ── */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[26px] lg:text-[30px] font-extrabold tracking-tight mb-2.5">
              The fastest way to price your project is to call.
            </h2>
            <p className="text-[15.5px] text-primary-100/90 leading-relaxed">
              Tell us what you&rsquo;re looking at and we&rsquo;ll tell you honestly what it takes.
              Most estimates get scheduled the same week — and we answer our own phone.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
            <CallLink context="mid-band" variant="light" className="text-[16px] whitespace-nowrap">
              <Phone className="w-[18px] h-[18px] flex-shrink-0" /> {siteConfig.phone}
            </CallLink>
            <EmailLink
              context="mid-band"
              variant="bare"
              className="btn-3d btn-3d-dark inline-flex items-center justify-center gap-2.5 bg-white/10 border-[1.5px] border-white/25 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/15 text-[16px] whitespace-nowrap"
            >
              <Mail className="w-[18px] h-[18px] flex-shrink-0" /> Email us
            </EmailLink>
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-white via-primary-50 to-earth-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
            Transformation
          </div>
          <h2 className="text-[clamp(27px,3.2vw,38px)] font-extrabold tracking-tight text-gray-900 mb-4">
            Whitney Oaks, Rocklin — two growing seasons apart
          </h2>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.35fr_0.8fr] gap-10 lg:gap-12 items-center">
            <div className="frame-earth">
              <BeforeAfterSlider
                beforeSrc="/home/whitney-oaks-before.jpg"
                afterSrc="/home/whitney-oaks-after.jpg"
                beforeAlt="Whitney Oaks frontage before renovation, September 2024"
                afterAlt="Whitney Oaks frontage after renovation, June 2026"
                beforeLabel="Sept 2024"
                afterLabel="June 2026"
              />
            </div>
            <div>
              <h3 className="text-[23px] font-bold text-gray-900 mb-3">
                Drag the line. That&rsquo;s the work.
              </h3>
              <p className="text-[15.5px] text-gray-600 mb-4 leading-relaxed">
                A tired frontage regraded, replanted with a drought-tolerant foothill palette, and
                mulched to build living soil — designed to keep improving on its own schedule.
              </p>
              <div className="text-sm text-gray-500 border-t border-earth-200 pt-4 leading-[2.1] mb-6">
                <b className="text-gray-900 font-semibold">Scope</b> — planting design, soil rebuild,
                drip irrigation
                <br />
                <b className="text-gray-900 font-semibold">Palette</b> — natives &amp; Mediterranean,
                low water
                <br />
                <b className="text-gray-900 font-semibold">Horizon</b> — designed for year thirty
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <CallLink
                  context="before-after"
                  variant="solid"
                  className="text-[15px] whitespace-nowrap"
                />
                <EmailLink
                  context="before-after"
                  variant="outline"
                  className="text-[15px] whitespace-nowrap"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" /> Email us
                </EmailLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT STARTS ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              What Happens Next
            </div>
            <h2 className="text-[clamp(27px,3.2vw,38px)] font-extrabold tracking-tight text-gray-900 mb-3.5">
              Three Steps, No Sales Pitch
            </h2>
            <p className="text-[16.5px] text-gray-600">
              Getting a number from us is simple, and it costs nothing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {steps.map((s) => (
              <div
                key={s.n}
                className="bg-white border-2 border-earth-300 rounded-2xl p-7 shadow-[0_10px_26px_-16px_rgba(20,26,18,0.3)]"
              >
                <div className="w-11 h-11 rounded-full bg-primary-700 text-white font-extrabold text-lg flex items-center justify-center mb-4">
                  {s.n}
                </div>
                <h3 className="text-[19px] font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-[14.5px] text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section
        id="portfolio-contact"
        className="pb-24 pt-4 scroll-mt-24"
        aria-labelledby="contact-heading"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
            Contact
          </div>
          <h2
            id="contact-heading"
            className="text-[clamp(27px,3.2vw,38px)] font-extrabold tracking-tight text-gray-900 mb-4"
          >
            Get Your Project on the Calendar
          </h2>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
            <div>
              <p className="text-[16.5px] text-gray-600 mb-7 leading-relaxed">
                Calling is fastest — you&rsquo;ll get Elliot, not a call center. Prefer to write? Email
                the address below and we&rsquo;ll reply within one business day.
              </p>

              <CallLink
                context="contact-block"
                variant="bare"
                className="block border-t border-earth-200 py-[18px] group"
              >
                <span className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-1">
                  <Phone className="w-3.5 h-3.5" /> Call or Text
                </span>
                <span className="text-[26px] font-extrabold text-gray-900 group-hover:text-primary-700 transition">
                  {siteConfig.phone}
                </span>
              </CallLink>

              <EmailLink
                context="contact-block"
                variant="bare"
                className="block border-t border-earth-200 py-[18px] group"
              >
                <span className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-1">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span className="text-[19px] font-bold text-gray-900 group-hover:text-primary-700 transition break-all">
                  {siteConfig.email}
                </span>
              </EmailLink>

              <div className="border-t border-earth-200 py-[18px]">
                <span className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Service Area
                </span>
                <span className="text-[15px] font-semibold text-gray-900">
                  {siteConfig.cities.join(" · ")} and the surrounding foothills
                </span>
              </div>

              <div className="border-t border-earth-200 py-[18px]">
                <span className="block text-[11.5px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-1">
                  License
                </span>
                <span className="text-[15px] font-semibold text-gray-900">
                  {siteConfig.license} · Bonded &amp; Insured
                </span>
              </div>

              <p className="mt-6 text-[14.5px] text-gray-600">
                Curious what your yard could look like first?{" "}
                <Link href="/app" className="text-primary-700 font-semibold hover:underline">
                  Try the free design tool
                  <ArrowRight className="inline w-4 h-4 ml-0.5 align-[-2px]" />
                </Link>
              </p>
            </div>

            <div className="rounded-2xl border-2 border-earth-200 bg-gradient-to-br from-primary-50/60 to-earth-50 p-6 md:p-8">
              <h3 className="text-[21px] font-bold text-gray-900 mb-1.5">Request a free estimate</h3>
              <p className="text-[14.5px] text-gray-600 mb-6">
                Tell us about the property. We&rsquo;ll follow up by phone or email — your choice.
              </p>
              <LeadForm
                service="Portfolio — project inquiry"
                submitLabel="Request My Free Estimate"
                note={`Prefer to talk now? Call or text ${siteConfig.phone}.`}
              />
            </div>
          </div>
        </div>
      </section>

      <StickyContactBar />
    </div>
  );
}
