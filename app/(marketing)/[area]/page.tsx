import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, MapPin, Phone, Mail } from "lucide-react";
import { siteConfig, siteUrl } from "@/lib/siteConfig";
import { getServiceArea, serviceAreas } from "@/lib/serviceAreas";
import { allServiceLinks } from "@/lib/services";
import { projects } from "@/lib/portfolio";
import LeadForm from "@/components/LeadForm";

/**
 * City landing pages: /granite-bay-landscaping, /loomis-landscaping, …
 * One per entry in lib/serviceAreas.ts, prerendered at build time. Any other
 * single-segment path that isn't a real page still 404s (dynamicParams).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return serviceAreas.map((a) => ({ area: a.slug }));
}

type Props = { params: Promise<{ area: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = getServiceArea((await params).area);
  if (!area) return {};
  return {
    title: `${area.metaTitle} | ${siteConfig.name}`,
    description: area.metaDescription,
    alternates: { canonical: `/${area.slug}` },
    openGraph: {
      title: area.metaTitle,
      description: area.metaDescription,
      url: `/${area.slug}`,
      type: "website",
      images: [{ url: area.heroImage.src, alt: area.heroImage.alt }],
    },
  };
}

/** Headline with the {{accent}} words tinted. */
function Headline({ text }: { text: string }) {
  return (
    <h1 className="text-[clamp(30px,3.6vw,46px)] font-extrabold tracking-tight leading-[1.14] mb-5">
      {text.split(/(\{\{.*?\}\})/g).map((part, i) =>
        part.startsWith("{{") ? (
          <span key={i} className="text-primary-300">
            {part.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </h1>
  );
}

export default async function ServiceAreaPage({ params }: Props) {
  const area = getServiceArea((await params).area);
  if (!area) notFound();

  const { city } = area;
  const pageUrl = `${siteUrl}/${area.slug}`;

  const services = area.services.flatMap((s) => {
    const link = allServiceLinks.find((l) => l.href === s.href);
    return link ? [{ ...link, why: s.why }] : [];
  });
  const work = area.work.flatMap((slug) => projects.find((p) => p.slug === slug) ?? []);
  const otherAreas = serviceAreas.filter((a) => a.slug !== area.slug);

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
        image: `${siteUrl}${area.heroImage.src}`,
        areaServed: siteConfig.cities.map((c) => ({ "@type": "City", name: `${c}, CA` })),
      },
      {
        "@type": "Service",
        name: `Landscaping in ${city}, CA`,
        serviceType: "Landscaping",
        url: pageUrl,
        description: area.metaDescription,
        provider: { "@id": `${siteUrl}/#business` },
        areaServed: { "@type": "City", name: `${city}, CA` },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `Landscaping services in ${city}`,
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.label },
          })),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: area.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Service Areas", item: `${siteUrl}/#service-areas` },
          { "@type": "ListItem", position: 3, name: city, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ── */}
      <header data-cta-location="hero" className="bg-gradient-to-br from-primary-800 to-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-primary-100/75">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden />
            <Link href="/#service-areas" className="hover:text-white">
              Service Areas
            </Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden />
            <span aria-current="page" className="text-white font-semibold">
              {city}
            </span>
          </nav>
        </div>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center pt-10 pb-20 lg:pt-14 lg:pb-24">
          <div>
            <div className="flex items-center gap-2 text-[12.5px] font-bold tracking-[0.22em] uppercase text-primary-300 mb-5">
              <MapPin className="w-4 h-4" aria-hidden /> Landscaping · {city}, CA
            </div>
            <Headline text={area.headline} />
            <p className="text-[17px] text-primary-100/90 mb-8 max-w-[50ch] leading-relaxed">{area.intro}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#contact"
                data-cta="area-free-estimate"
                className="btn-3d btn-3d-dark inline-flex items-center gap-2.5 bg-white text-primary-900 font-bold px-7 py-3.5 rounded-xl hover:bg-primary-50"
              >
                Get a Free Estimate <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.phoneHref}
                className="btn-3d btn-3d-dark inline-flex items-center gap-2.5 bg-white/10 border-2 border-white/50 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl"
              >
                <Phone className="w-4 h-4" /> {siteConfig.phone}
              </a>
            </div>
            <div className="mt-7 text-[12.5px] tracking-wide text-primary-100/70 font-medium">
              {siteConfig.license} · Bonded &amp; Insured · Free on-site estimates
            </div>
          </div>

          <figure>
            <div className="frame-earth rotate-[0.6deg]">
              <Image
                src={area.heroImage.src}
                alt={area.heroImage.alt}
                width={840}
                height={630}
                sizes="(max-width: 1024px) 92vw, 540px"
                priority
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-center text-[13px] text-primary-100/75">
              {area.heroImage.caption}
            </figcaption>
          </figure>
        </div>
      </header>

      {/* ── LOCAL CONDITIONS ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Local Knowledge
            </div>
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900">
              {area.conditionsHeading}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {area.conditions.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="bg-white border-2 border-earth-300 rounded-2xl p-7 shadow-[0_10px_26px_-16px_rgba(20,26,18,0.3)]"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" aria-hidden />
                  </div>
                  <h3 className="text-[19px] font-bold text-gray-900 mb-2">{c.title}</h3>
                  <p className="text-[14.5px] text-gray-600 leading-relaxed">{c.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SERVICES IN THIS TOWN ── */}
      <section data-cta-location="area-services" className="py-20 lg:py-24 bg-gradient-to-b from-white via-primary-50 to-earth-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Services
            </div>
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-3.5">
              What we build and care for in {city}
            </h2>
            <p className="text-[16.5px] text-gray-600">
              Design, construction, and care from one licensed crew — no handing you off between
              trades.
            </p>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    data-cta={s.cta}
                    className="group flex h-full items-start gap-4 bg-white border-2 border-earth-200 rounded-2xl p-5 hover:border-primary-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_-18px_rgba(20,83,45,0.4)] transition"
                  >
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary-50 text-primary-700 group-hover:bg-primary-600 group-hover:text-white transition-colors shrink-0">
                      <Icon className="w-5 h-5" aria-hidden />
                    </span>
                    <span>
                      <span className="flex items-center gap-1.5 text-[16px] font-bold text-gray-900 group-hover:text-primary-800">
                        {s.label}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" aria-hidden />
                      </span>
                      <span className="block text-[14px] text-gray-600 leading-snug mt-1">{s.why}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── RECENT WORK ── */}
      <section data-cta-location="area-work" className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div className="max-w-2xl">
              <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
                Recent Work
              </div>
              <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-3">
                Built by hand, in the foothills
              </h2>
              <p className="text-[16.5px] text-gray-600">
                Real projects from across our service area, photographed as built. Carpentry,
                stonework, and grading are all in-house.
              </p>
            </div>
            <Link
              href="/portfolio"
              data-cta="view-portfolio"
              className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
            >
              See the full portfolio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {work.map((p) => (
              <Link
                key={p.slug}
                href="/portfolio#work"
                data-cta="area-work-card"
                className="group bg-white border-2 border-earth-300 rounded-2xl p-2.5 shadow-[0_10px_26px_-16px_rgba(20,26,18,0.3)] hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-18px_rgba(20,83,45,0.35)] transition"
              >
                <div className="overflow-hidden rounded-lg shadow-[0_0_0_1px_#e8dcc4]">
                  <Image
                    src={p.image}
                    alt={p.alt}
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 92vw, 31vw"
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="px-3 pt-4 pb-2.5">
                  <h3 className="text-[17px] font-bold text-gray-900 mb-1">{p.title}</h3>
                  <p className="text-[14px] text-gray-600 leading-snug">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEIGHBORHOODS ── */}
      <section className="py-16 lg:py-20 border-y border-earth-200 bg-earth-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <h2 className="text-[clamp(23px,2.6vw,30px)] font-extrabold tracking-tight text-gray-900 mb-3">
              Where we work in {city}
            </h2>
            <p className="text-[15.5px] text-gray-600 mb-5">
              All of {city}, including these neighborhoods — and the places just outside it.
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {area.neighborhoods.map((n) => (
                <li
                  key={n}
                  className="px-4 py-2 rounded-full bg-white border-[1.5px] border-earth-200 text-[14px] font-semibold text-gray-800"
                >
                  {n}
                </li>
              ))}
              {area.nearby.map((n) => (
                <li
                  key={n}
                  className="px-4 py-2 rounded-full border-[1.5px] border-dashed border-earth-300 text-[14px] font-medium text-gray-600"
                >
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-[clamp(23px,2.6vw,30px)] font-extrabold tracking-tight text-gray-900 mb-3">
              Also serving
            </h2>
            <p className="text-[15.5px] text-gray-600 mb-5">
              The same crew works across the Placer County foothills.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {otherAreas.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/${a.slug}`}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border-[1.5px] border-earth-200 text-[15px] font-semibold text-gray-900 hover:border-primary-300 hover:text-primary-800 transition"
                  >
                    <MapPin className="w-4 h-4 text-primary-600 shrink-0" aria-hidden />
                    Landscaping in {a.city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-8 text-center">
            {city} landscaping questions
          </h2>
          <div className="divide-y divide-earth-200 border-y border-earth-200">
            {area.faqs.map((f) => (
              <details key={f.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-bold text-gray-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronRight className="w-5 h-5 text-primary-600 shrink-0 transition-transform group-open:rotate-90" aria-hidden />
                </summary>
                <p className="pb-5 pr-9 text-[15.5px] text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" data-cta-location="contact-section" className="pb-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
          <div>
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Free Estimate
            </div>
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-4">
              Tell us about your {city} property
            </h2>
            <p className="text-[16.5px] text-gray-600 mb-8 leading-relaxed">
              We&rsquo;ll walk it with you — usually within a week — and follow up with a written
              scope and price. No pressure and no obligation.
            </p>
            <a
              href={siteConfig.phoneHref}
              className="btn-3d inline-flex items-center gap-2.5 bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-500 hover:to-green-500 text-white font-bold px-7 py-4 rounded-xl mb-6"
            >
              <Phone className="w-5 h-5" /> Call or Text {siteConfig.phone}
            </a>
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="w-4 h-4 shrink-0" aria-hidden />
              <a href={`mailto:${siteConfig.email}`} className="text-primary-700 font-semibold hover:underline break-all">
                {siteConfig.email}
              </a>
            </p>
          </div>
          <div className="rounded-2xl border-2 border-earth-200 bg-gradient-to-br from-primary-50/60 to-earth-50 p-6 md:p-8">
            <LeadForm
              service={`${city} — landscaping estimate`}
              submitLabel="Request My Free Estimate"
              defaultCity={city}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
