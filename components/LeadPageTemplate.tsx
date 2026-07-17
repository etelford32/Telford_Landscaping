import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import LeadForm from "@/components/LeadForm";

export interface LeadFeature {
  icon: LucideIcon;
  title: string;
  body: string;
  points?: string[];
}

export interface LeadFact {
  stat: string;
  label: string;
}

export interface LeadPageContent {
  /** Small uppercase eyebrow above the headline. */
  eyebrow: string;
  /** Hero headline. Wrap the accent words in {{ }} to color them. */
  title: string;
  /** Hero supporting paragraph. */
  intro: string;
  /** Framed hero photo. */
  heroImage: { src: string; alt: string };
  /** Short fact / stat strip under the hero. */
  facts: LeadFact[];
  /** Section heading for the feature grid. */
  featuresHeading: string;
  featuresLede: string;
  features: LeadFeature[];
  /** Mid-page editorial block. */
  pitchHeading: string;
  pitchBody: string[];
  pitchImage: { src: string; alt: string };
  /** Used to tag the form submission + form heading. */
  service: string;
  formHeading: string;
  formLede: string;
}

/** Renders a headline where {{accent}} spans are tinted green. */
function AccentHeading({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\{\{.*?\}\})/g);
  return (
    <h1 className={className}>
      {parts.map((p, i) =>
        p.startsWith("{{") && p.endsWith("}}") ? (
          <span key={i} className="text-primary-300">
            {p.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </h1>
  );
}

export default function LeadPageTemplate({ content }: { content: LeadPageContent }) {
  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center pt-16 pb-20 lg:pt-20 lg:pb-24">
          <div>
            <div className="text-[12.5px] font-bold tracking-[0.22em] uppercase text-primary-300 mb-5">
              {content.eyebrow}
            </div>
            <AccentHeading
              text={content.title}
              className="text-[clamp(30px,3.6vw,46px)] font-extrabold tracking-tight leading-[1.14] mb-5"
            />
            <p className="text-[17px] text-primary-100/90 mb-8 max-w-[48ch] leading-relaxed">
              {content.intro}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#bid"
                className="btn-3d btn-3d-dark inline-flex items-center gap-2.5 bg-white text-primary-900 font-bold px-7 py-3.5 rounded-xl hover:bg-primary-50"
              >
                Request a Free Bid <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.phoneHref}
                className="btn-3d btn-3d-dark inline-flex items-center gap-2.5 bg-white/10 border-2 border-white/50 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl"
              >
                <Phone className="w-4 h-4" /> {siteConfig.phone}
              </a>
            </div>
            <div className="mt-7 text-[12.5px] tracking-wide text-primary-100/70 font-medium">
              {siteConfig.license} · Bonded &amp; Insured · Serving {siteConfig.cities.slice(0, 4).join(", ")}
            </div>
          </div>

          <div className="relative">
            <div className="frame-earth rotate-[0.6deg]">
              <Image
                src={content.heroImage.src}
                alt={content.heroImage.alt}
                width={840}
                height={630}
                priority
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FACTS ── */}
      <section className="border-b border-earth-200 bg-earth-50">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {content.facts.map((f) => (
            <div key={f.label}>
              <div className="text-[28px] font-extrabold text-primary-700 leading-none mb-1.5">
                {f.stat}
              </div>
              <div className="text-sm text-gray-600 leading-snug">{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-3.5">
              {content.featuresHeading}
            </h2>
            <p className="text-[16.5px] text-gray-600">{content.featuresLede}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {content.features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white border-2 border-earth-300 rounded-2xl p-7 shadow-[0_10px_26px_-16px_rgba(20,26,18,0.3)] hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-18px_rgba(20,83,45,0.35)] transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-[19px] font-bold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-[14.5px] text-gray-600 mb-3">{feat.body}</p>
                  {feat.points && (
                    <ul className="space-y-1.5">
                      {feat.points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-[13.5px] text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PITCH ── */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-white via-primary-50 to-earth-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="frame-earth rotate-[-0.6deg]">
            <Image
              src={content.pitchImage.src}
              alt={content.pitchImage.alt}
              width={840}
              height={630}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-[clamp(25px,3vw,34px)] font-extrabold tracking-tight text-gray-900 mb-5">
              {content.pitchHeading}
            </h2>
            {content.pitchBody.map((p, i) => (
              <p key={i} className="text-[16px] text-gray-600 mb-4 leading-relaxed">
                {p}
              </p>
            ))}
            <a href="#bid" className="text-primary-700 font-semibold hover:underline">
              Get a free bid for your property →
            </a>
          </div>
        </div>
      </section>

      {/* ── BID / CONTACT ── */}
      <section id="bid" className="py-20 lg:py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
          <div>
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Free Bid
            </div>
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-4">
              {content.formHeading}
            </h2>
            <p className="text-[16.5px] text-gray-600 mb-8 leading-relaxed">{content.formLede}</p>

            <a
              href={siteConfig.phoneHref}
              className="btn-3d inline-flex items-center gap-2.5 bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-500 hover:to-green-500 text-white font-bold px-7 py-4 rounded-xl mb-6"
            >
              <Phone className="w-5 h-5" /> Call or Text {siteConfig.phone}
            </a>
            <p className="text-sm text-gray-500">
              Prefer email?{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-primary-700 font-semibold hover:underline break-all">
                {siteConfig.email}
              </a>
            </p>
          </div>

          <div className="rounded-2xl border-2 border-earth-200 bg-gradient-to-br from-primary-50/60 to-earth-50 p-6 md:p-8">
            <LeadForm service={content.service} submitLabel="Request My Free Bid" />
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA STRIP ── */}
      <section className="bg-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            One shop, one set of hands, start to finish.
          </h2>
          <p className="text-primary-100/80 mb-7 max-w-2xl mx-auto">
            Design-build across the Sacramento foothills. Explore our other approaches or open the
            design tool to see your yard thirty years out.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/fire-wise-landscaping"
              className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/25 hover:bg-white/20 font-semibold text-sm transition"
            >
              Fire-Wise
            </Link>
            <Link
              href="/water-smart-landscaping"
              className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/25 hover:bg-white/20 font-semibold text-sm transition"
            >
              Water-Smart
            </Link>
            <Link
              href="/native-low-maintenance"
              className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/25 hover:bg-white/20 font-semibold text-sm transition"
            >
              Low-Maintenance Native
            </Link>
            <Link
              href="/app"
              className="px-5 py-2.5 rounded-xl bg-white text-primary-900 hover:bg-primary-50 font-bold text-sm transition"
            >
              Open the Design Tool
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
