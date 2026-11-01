import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Droplets,
  FileText,
  Hammer,
  HardHat,
  Mail,
  Mountain,
  Phone,
  Scissors,
  Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { plansForQuoteMailto } from "@/lib/contactLinks";
import ContractorQuoteForm from "@/components/ContractorQuoteForm";

export const metadata: Metadata = {
  title: "For Contractors | Landscape Subcontractor — Planting, Irrigation, Erosion Control",
  description:
    "C-27 licensed landscape subcontractor for general contractors and builders in Placer County and the Sacramento foothills. Installation, planting, irrigation, erosion-control installation, and vegetation management. Send plans for a quote.",
  keywords:
    "landscape subcontractor Placer County, landscape subcontractor Roseville, irrigation subcontractor, erosion control installation, planting subcontractor, vegetation management contractor, C-27 landscape contractor Auburn, send plans for bid",
  alternates: { canonical: "/for-contractors" },
  openGraph: {
    title: "For Contractors — Landscape Subcontract Scopes",
    description:
      "Installation, planting, irrigation, erosion control, and vegetation management to your plans and schedule. Send plans for a quote.",
    type: "website",
  },
};

interface Scope {
  icon: LucideIcon;
  title: string;
  body: string;
  points: string[];
}

const scopes: Scope[] = [
  {
    icon: Hammer,
    title: "Landscape installation",
    body: "The full landscape package built to your plans, from finish grade to final walk.",
    points: [
      "Soil prep, amendments, and fine grading for landscape",
      "Hardscape: walls, paths, flagstone, DG, edging, boulders",
      "Mulch, rock, and finish materials per spec",
    ],
  },
  {
    icon: Sprout,
    title: "Planting",
    body: "Trees, shrubs, and groundcover installed to the plant schedule and spacing on the sheets.",
    points: [
      "Box trees through flats, staked and planted to detail",
      "Native and fire-smart palettes for foothill sites",
      "Establishment watering and punch-list replacements",
    ],
  },
  {
    icon: Droplets,
    title: "Irrigation",
    body: "Drip and spray systems installed to the irrigation plan and tied in at the point of connection.",
    points: [
      "Mainline, laterals, valves, and drip zones",
      "Controllers, smart timers, and sensors set up and programmed",
      "Pressure-checked and documented for closeout",
    ],
  },
  {
    icon: Mountain,
    title: "Erosion-control installation",
    body: "Erosion and sediment-control measures installed to your erosion-control plan or SWPPP.",
    points: [
      "Fiber rolls / straw wattles and silt fence",
      "Erosion-control blankets and slope seeding",
      "Inlet protection and rock at outfalls, as specified",
    ],
  },
  {
    icon: Scissors,
    title: "Vegetation management",
    body: "Clearing and ongoing control so the site is buildable, safe, and inspection-ready.",
    points: [
      "Brush clearing and defensible-space work",
      "Invasive and weed removal, abatement mowing",
      "Limbing and canopy separation around structures",
    ],
  },
  {
    icon: ClipboardList,
    title: "How we work with GCs",
    body: "One point of contact, clear numbers, and a crew that shows up when the schedule says.",
    points: [
      "Itemized quotes against your plan quantities",
      "Clarifications and exclusions spelled out up front",
      "Photo progress and closeout documentation",
    ],
  },
];

const steps = [
  {
    title: "Send the plans",
    body: "Use the form or email the set. Tell us the location, the scopes you need priced, rough quantities, and your schedule.",
  },
  {
    title: "We take off and clarify",
    body: "We review the sheets, check quantities, and send any RFIs or questions before we price — not after.",
  },
  {
    title: "Itemized quote",
    body: "You get a line-item number by scope with inclusions, exclusions, and the schedule we can hold.",
  },
  {
    title: "Build and close out",
    body: "We coordinate with your super, build to the plans, and close out with photos and as-builts.",
  },
];

const checklist = [
  { label: "Location", detail: "Address or cross streets and city" },
  { label: "Scope", detail: "Which of the five scopes you want priced" },
  { label: "Quantities", detail: "SF, LF, plant counts, acres — or point us to the sheets" },
  { label: "Schedule", detail: "Start date, duration, phasing, and bid due date" },
  { label: "Plans", detail: "Landscape, irrigation, and erosion-control sheets plus specs" },
];

export default function ForContractorsPage() {
  const plansMailto = plansForQuoteMailto();

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section data-cta-location="hero" className="bg-gradient-to-br from-primary-800 to-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center pt-16 pb-20 lg:pt-20 lg:pb-24">
          <div>
            <div className="inline-flex items-center gap-2 text-[12.5px] font-bold tracking-[0.22em] uppercase text-primary-300 mb-5">
              <HardHat className="w-4 h-4" /> For Contractors · Subcontract Scopes
            </div>
            <h1 className="text-[clamp(30px,3.6vw,46px)] font-extrabold tracking-tight leading-[1.14] mb-5">
              Your landscape scope, <span className="text-primary-300">built to plan</span> and on schedule.
            </h1>
            <p className="text-[17px] text-primary-100/90 mb-8 max-w-[50ch] leading-relaxed">
              We work as the landscape subcontractor for general contractors, builders, and developers
              across Placer County and the Sacramento foothills — installation, planting, irrigation,
              erosion-control installation, and vegetation management.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#send-plans"
                data-cta="send-plans"
                className="btn-3d btn-3d-dark inline-flex items-center gap-2.5 bg-white text-primary-900 font-bold px-7 py-3.5 rounded-xl hover:bg-primary-50"
              >
                Send Plans for a Quote <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.phoneHref}
                className="btn-3d btn-3d-dark inline-flex items-center gap-2.5 bg-white/10 border-2 border-white/50 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl"
              >
                <Phone className="w-4 h-4" /> {siteConfig.phone}
              </a>
            </div>
            <div className="mt-7 text-[12.5px] tracking-wide text-primary-100/70 font-medium">
              {siteConfig.license} · Bonded &amp; Insured · {siteConfig.legalName}
            </div>
          </div>

          <div className="relative">
            <div className="frame-earth rotate-[0.6deg]">
              <Image
                src="/home/portfolio-hillside-stairs.jpg"
                alt="Redwood staircase beside a curved segmental block retaining wall on a graded foothill slope"
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
          {[
            { stat: "C-27", label: "California licensed landscape contractor, bonded and insured" },
            { stat: "5 scopes", label: "priced separately or as one landscape package" },
            { stat: "1 business day", label: "to acknowledge your plans and confirm the bid date" },
          ].map((f) => (
            <div key={f.stat}>
              <div className="text-[28px] font-extrabold text-primary-700 leading-none mb-1.5">{f.stat}</div>
              <div className="text-sm text-gray-600 leading-snug">{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCOPES ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-3.5">
              Subcontract scopes we bid
            </h2>
            <p className="text-[16.5px] text-gray-600">
              Price one scope or the whole landscape package. We build to your plans and specs, and flag
              conflicts before they become change orders.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {scopes.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="bg-white border-2 border-earth-300 rounded-2xl p-7 shadow-[0_10px_26px_-16px_rgba(20,26,18,0.3)] hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-18px_rgba(20,83,45,0.35)] transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-[19px] font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-[14.5px] text-gray-600 mb-3">{s.body}</p>
                  <ul className="space-y-1.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-[13.5px] text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section data-cta-location="process" className="py-20 lg:py-24 bg-gradient-to-b from-white via-primary-50 to-earth-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="frame-earth rotate-[-0.6deg]">
            <Image
              src="/home/portfolio-fence-clearing.jpg"
              alt="Cleared foothill lot with a new fence line following the grade"
              width={840}
              height={630}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-[clamp(25px,3vw,34px)] font-extrabold tracking-tight text-gray-900 mb-6">
              From plan set to closeout
            </h2>
            <ol className="space-y-5">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-700 text-white font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-[15px] text-gray-600 leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── SEND PLANS ── */}
      <section id="send-plans" data-cta-location="send-plans" className="py-20 lg:py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16">
          <div>
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Send Plans for a Quote
            </div>
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-4">
              Get your landscape scope priced
            </h2>
            <p className="text-[16.5px] text-gray-600 mb-6 leading-relaxed">
              Fill out the form with a link to the plans, or email the set directly. The more of this we
              have up front, the faster and tighter the number:
            </p>

            <ul className="space-y-3 mb-8">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">
                    <strong className="text-gray-900">{c.label}</strong> — {c.detail}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              <a
                href={plansMailto}
                className="btn-3d inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-500 hover:to-green-500 text-white font-bold px-7 py-4 rounded-xl"
              >
                <Mail className="w-5 h-5" /> Email Plans for a Quote
              </a>
              <a
                href={siteConfig.phoneHref}
                className="inline-flex items-center justify-center gap-2.5 border-2 border-primary-600 text-primary-700 hover:bg-primary-50 font-bold px-7 py-3.5 rounded-xl transition"
              >
                <Phone className="w-5 h-5" /> Call or Text {siteConfig.phone}
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              The email opens pre-filled with location, scope, quantities, and schedule — just attach the
              PDFs. Sending to{" "}
              <a href={plansMailto} className="text-primary-700 font-semibold hover:underline break-all">
                {siteConfig.email}
              </a>
              .
            </p>
          </div>

          <div className="rounded-2xl border-2 border-earth-200 bg-gradient-to-br from-primary-50/60 to-earth-50 p-6 md:p-8">
            <ContractorQuoteForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA STRIP ── */}
      <section data-cta-location="footer-cta" className="bg-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Have a bid due? Send the plans today.
          </h2>
          <p className="text-primary-100/80 mb-7 max-w-2xl mx-auto">
            Serving {siteConfig.cities.join(", ")} and the surrounding Placer County foothills.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#send-plans"
              data-cta="send-plans"
              className="px-6 py-3 rounded-xl bg-white text-primary-900 hover:bg-primary-50 font-bold text-sm transition"
            >
              Send Plans for a Quote
            </a>
            <a
              href={siteConfig.phoneHref}
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/25 hover:bg-white/20 font-semibold text-sm transition"
            >
              Call {siteConfig.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
