import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  Waves,
  CloudRain,
  Spline,
  Shovel,
  Layers,
  Mountain,
  Search,
  ClipboardCheck,
  Construction,
  Droplets,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import LeadForm from "@/components/LeadForm";
import FrenchDrainDiagram, { DRAIN_LAYERS } from "@/components/drainage/FrenchDrainDiagram";

export const metadata: Metadata = {
  title: "Drainage & Trenching | French Drains, Grading & Excavation — Granite Bay, Loomis, Auburn",
  description:
    "Yard drainage done right: French drains, catch basins and surface-water collection, drain piping, trenching and excavation, compacted backfill, and landscape grading that moves water away from your home. Serving Granite Bay, Loomis, Auburn, Roseville, and Lincoln. Request a free bid.",
  keywords:
    "French drain installation Granite Bay, yard drainage Loomis, drainage contractor Auburn CA, trenching Roseville, catch basin installation, downspout drain lines, landscape grading Sacramento foothills, excavation and backfill, standing water yard fix, regrading away from foundation",
  alternates: { canonical: "/drainage-trenching" },
  openGraph: {
    title: "Drainage & Trenching — Move the Water, Keep the Yard",
    description:
      "French drains, surface-water collection, drain piping, excavation, backfill, and grading — built by the same crew that builds the landscape on top.",
    type: "website",
  },
};

interface DrainService {
  icon: LucideIcon;
  title: string;
  body: string;
  points: string[];
}

const SERVICES: DrainService[] = [
  {
    icon: Waves,
    title: "French Drains",
    body: "A fabric-wrapped stone trench with perforated pipe that intercepts groundwater before it reaches your foundation, patio, or lawn.",
    points: [
      "Foundation, hillside, and lawn interceptor drains",
      "Geotextile-wrapped, washed ¾-in. drain rock",
      "Finished with river rock or re-laid sod",
    ],
  },
  {
    icon: CloudRain,
    title: "Surface-Water Collection",
    body: "Catch the water where it lands — at downspouts, low spots, and hardscape edges — and send it somewhere useful.",
    points: [
      "Catch basins and channel / trench drains",
      "Downspout tie-ins with buried solid lines",
      "Dry creek beds and swales that look designed",
    ],
  },
  {
    icon: Spline,
    title: "Drain Piping",
    body: "Solid pipe for conveyance, perforated pipe for collection, each laid to a steady fall so nothing sits and silts up.",
    points: [
      "Smooth-wall solid and perforated drain lines",
      "Cleanouts at turns for future maintenance",
      "Daylight outlets, pop-up emitters, and dry wells",
    ],
  },
  {
    icon: Shovel,
    title: "Trenching & Excavation",
    body: "Machine trenching where there's room, careful hand digging where there are roots, utilities, or finished work to protect.",
    points: [
      "811 utility locate called before every dig",
      "Mini-excavator and trencher access for tight yards",
      "Hand excavation around mature tree roots",
    ],
  },
  {
    icon: Layers,
    title: "Backfill & Compaction",
    body: "The part that decides whether a trench line sinks in a year. We backfill in lifts and compact each one.",
    points: [
      "Compacted lifts — no settled trench scars",
      "Drain rock vs. native soil placed where each belongs",
      "Topsoil, sod, and planting restored on top",
    ],
  },
  {
    icon: Mountain,
    title: "Landscape Grading",
    body: "Most drainage problems are grading problems. We re-shape the ground so water leaves the house on its own.",
    points: [
      "Positive slope away from foundations",
      "Swales and berms to steer sheet flow",
      "Laser-level checked, not eyeballed",
    ],
  },
];

const WARNING_SIGNS = [
  "Puddles that are still there a day after the rain stops",
  "Soggy lawn, moss, or mushrooms in the same spot every winter",
  "Mulch and soil washing onto the patio or driveway",
  "Gullies or bare channels cut into a slope",
  "Downspouts dumping right at the foundation",
  "Damp crawlspace, musty smell, or water stains on stem walls",
  "White crust (efflorescence) on block walls and steps",
  "A retaining wall that's leaning, bulging, or weeping at the base",
];

const PROCESS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Search,
    title: "Walk the water",
    body: "We look at where water comes from, where it pools, and where it can legally go — slope, soil, downspouts, and the neighbor's yard included.",
  },
  {
    icon: ClipboardCheck,
    title: "Design the route",
    body: "A drawn plan with pipe runs, fall, outlet, and grade changes, plus a fixed bid. Utilities are located through 811 before anything is cut.",
  },
  {
    icon: Construction,
    title: "Dig, lay & backfill",
    body: "Trench to a true slope, set fabric, stone, and pipe, then backfill in compacted lifts. Roots, irrigation, and hardscape are protected along the way.",
  },
  {
    icon: Droplets,
    title: "Flow-test & restore",
    body: "We run water through every line before closing it up, then put the lawn, beds, and stone back so the work disappears.",
  },
];

const FAQ = [
  {
    q: "Do I need a French drain or just better surface drainage?",
    a: "It depends on where the water is coming from. Water that runs across the surface — off the roof, the patio, or a slope — is usually solved with grading, catch basins, and solid drain lines. Water that comes up through saturated soil or seeps out of a hillside needs a subsurface drain. Many properties need both, and we'll tell you which after walking it.",
  },
  {
    q: "Where does all the water go?",
    a: "Somewhere lower and legal: a daylight outlet on your own property, a dry well sized for the soil, a dry creek bed, or a curb outlet where the city allows it. We don't push your water onto a neighbor's lot.",
  },
  {
    q: "Can you work around my mature trees?",
    a: "Yes. Near trees we route lines outside the critical root zone where we can and hand-dig where we can't, so we're not shearing the structural roots that keep the tree standing.",
  },
  {
    q: "Will my lawn and garden be torn up?",
    a: "Temporarily. Sod is cut and set aside or replaced, beds are restored, and trench lines are compacted so they don't sink. Done right, the only sign we were there is that the water's gone.",
  },
  {
    q: "When is the best time to fix drainage?",
    a: "Before the rainy season, ideally late summer through fall, when soil is workable and you can see results the first storm. If it's already pouring, we can still diagnose — standing water shows exactly where the problem is.",
  },
];

const FACTS = [
  { stat: "6 in. / 10 ft", label: "minimum fall of grade away from a foundation under the residential code" },
  { stat: "⅛ in. / ft", label: "minimum fall we lay drain pipe to, so it flushes instead of silting up" },
  { stat: "811 first", label: "utilities located at least two working days before every excavation" },
];

export default function DrainageTrenchingPage() {
  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section
        data-cta-location="hero"
        className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-sky-950 text-white"
      >
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center pt-16 pb-20 lg:pt-20 lg:pb-24">
          <div>
            <div className="text-[12.5px] font-bold tracking-[0.22em] uppercase text-sky-300 mb-5">
              Drainage &amp; Trenching
            </div>
            <h1 className="text-[clamp(30px,3.6vw,46px)] font-extrabold tracking-tight leading-[1.14] mb-5">
              Move the water. <span className="text-sky-300">Keep the yard.</span>
            </h1>
            <p className="text-[17px] text-primary-100/90 mb-6 max-w-[48ch] leading-relaxed">
              Foothill clay doesn&rsquo;t drain, and a winter storm will find every low spot around your
              house. We build the system underneath — French drains, collection, piping, and grading —
              then put the landscape back on top so you never see it again.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-8 max-w-[52ch]">
              {SERVICES.map((s) => (
                <li key={s.title} className="flex items-center gap-2 text-[14.5px] text-primary-50">
                  <CheckCircle2 className="w-4 h-4 text-sky-300 flex-shrink-0" />
                  {s.title}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a
                href="#bid"
                data-cta="request-bid"
                className="btn-3d btn-3d-dark inline-flex items-center gap-2.5 bg-white text-primary-900 font-bold px-7 py-3.5 rounded-xl hover:bg-primary-50"
              >
                Request a Free Drainage Bid <ArrowRight className="w-4 h-4" />
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
                src="/portfolio/retaining-wall-90ft.jpg"
                alt="Ninety-foot segmental block retaining wall mid-build, with drain rock and a perforated drain line behind the block"
                width={840}
                height={630}
                priority
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute left-2.5 sm:-left-3.5 bottom-6 bg-white border border-earth-200 rounded-xl px-[18px] py-3 shadow-[0_12px_28px_-14px_rgba(20,26,18,0.35)] text-[13px] font-semibold text-gray-900 leading-snug">
              90-ft wall, drained behind the block
              <span className="block text-[11.5px] font-medium text-gray-500">
                Drain rock + perforated line, daylighted out
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FACTS ── */}
      <section className="border-b border-earth-200 bg-earth-50">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {FACTS.map((f) => (
            <div key={f.stat}>
              <div className="text-[28px] font-extrabold text-primary-700 leading-none mb-1.5">{f.stat}</div>
              <div className="text-sm text-gray-600 leading-snug">{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section data-cta-location="drainage-services" className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              What We Build
            </div>
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-3.5">
              Every piece of the drainage system, one crew
            </h2>
            <p className="text-[16.5px] text-gray-600">
              Drainage fails at the handoffs — the digger who isn&rsquo;t the grader, the grader who
              isn&rsquo;t the landscaper. We do the whole run, from the first shovel to the finished lawn.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="bg-white border-2 border-earth-300 rounded-2xl p-7 shadow-[0_10px_26px_-16px_rgba(20,26,18,0.3)] hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-18px_rgba(20,83,45,0.35)] transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-sky-700" />
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

      {/* ── ANATOMY OF A FRENCH DRAIN ── */}
      <section data-cta-location="drain-anatomy" className="py-20 lg:py-24 bg-gradient-to-b from-white via-sky-50/60 to-earth-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Under the Lawn
            </div>
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-3.5">
              Anatomy of a French drain that actually works
            </h2>
            <p className="text-[16.5px] text-gray-600">
              Most failed drains we dig up are missing one of these layers — usually the fabric or the
              slope. Here&rsquo;s what goes in the ground on every job.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-10 lg:gap-12 items-start">
            <div className="frame-earth">
              <FrenchDrainDiagram className="block w-full h-auto" />
            </div>
            <ol className="space-y-4">
              {DRAIN_LAYERS.map((l) => (
                <li key={l.n} className="flex gap-3.5">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-900 text-white text-[13px] font-bold flex items-center justify-center mt-0.5">
                    {l.n}
                  </span>
                  <div>
                    <div className="font-bold text-gray-900 text-[15.5px]">{l.title}</div>
                    <p className="text-[14px] text-gray-600 leading-relaxed">{l.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── WARNING SIGNS ── */}
      <section data-cta-location="warning-signs" className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Know the Signs
            </div>
            <h2 className="text-[clamp(25px,3vw,34px)] font-extrabold tracking-tight text-gray-900 mb-5">
              Your yard is telling you where the water goes
            </h2>
            <p className="text-[16px] text-gray-600 mb-4 leading-relaxed">
              Water that sits against a foundation, undercuts a slope, or saturates the soil behind a
              wall does slow, expensive damage. Fixing the drainage is almost always cheaper than fixing
              what it ruins.
            </p>
            <p className="text-[16px] text-gray-600 mb-6 leading-relaxed">
              It also matters for the landscape: most plants that &ldquo;mysteriously&rdquo; die in a
              foothill yard drowned in heavy clay over the winter.
            </p>
            <a href="#bid" data-cta="request-bid" className="text-primary-700 font-semibold hover:underline">
              Have us walk your property →
            </a>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WARNING_SIGNS.map((w) => (
              <li
                key={w}
                className="flex items-start gap-2.5 rounded-xl border-2 border-earth-200 bg-earth-50 px-4 py-3.5 text-[14px] text-gray-700"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section data-cta-location="process" className="py-20 lg:py-24 bg-gradient-to-b from-earth-50 to-white border-y border-earth-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              How It Goes
            </div>
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900">
              From standing water to a dry yard in four steps
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-white border-2 border-earth-300 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[13px] font-extrabold text-primary-700 tracking-widest">
                      0{i + 1}
                    </span>
                    <Icon className="w-5 h-5 text-sky-700" />
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PITCH ── */}
      <section data-cta-location="pitch" className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="frame-earth rotate-[-0.6deg]">
            <Image
              src="/home/service-hardscape.jpg"
              alt="Engineered block retaining wall on a graded slope"
              width={840}
              height={630}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-[clamp(25px,3vw,34px)] font-extrabold tracking-tight text-gray-900 mb-5">
              Drainage built by a landscaper, not just a digger
            </h2>
            <p className="text-[16px] text-gray-600 mb-4 leading-relaxed">
              A trench crew can bury pipe. What they don&rsquo;t do is plan the outlet around your future
              patio, keep the line out of the oak&rsquo;s root zone, or re-grade the bed so it sheds water
              and still looks right. That&rsquo;s the difference between a drain and a landscape that drains.
            </p>
            <p className="text-[16px] text-gray-600 mb-6 leading-relaxed">
              We pair drainage with the rest of the work — retaining walls, hardscape, irrigation, and
              planting — so it&rsquo;s designed once and built once, instead of dug up again next year.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#bid" data-cta="request-bid" className="text-primary-700 font-semibold hover:underline">
                Get a free drainage bid →
              </a>
              <Link href="/portfolio" data-cta="view-portfolio" className="text-primary-700 font-semibold hover:underline">
                See walls &amp; grading work →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section data-cta-location="faq" className="py-20 lg:py-24 bg-gradient-to-b from-white via-primary-50 to-earth-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Questions
            </div>
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900">
              Drainage FAQ
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group bg-white border-2 border-earth-200 rounded-2xl px-6 py-4 open:shadow-[0_14px_30px_-20px_rgba(20,26,18,0.35)]"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-bold text-gray-900 text-[16px]">
                  {f.q}
                  <span className="text-primary-700 text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── BID / CONTACT ── */}
      <section id="bid" data-cta-location="bid-section" className="py-20 lg:py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
          <div>
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Free Bid
            </div>
            <h2 className="text-[clamp(27px,3.2vw,36px)] font-extrabold tracking-tight text-gray-900 mb-4">
              Get a free drainage &amp; trenching bid
            </h2>
            <p className="text-[16.5px] text-gray-600 mb-6 leading-relaxed">
              Tell us where the water collects and what it&rsquo;s damaging. Photos or a video from the
              last storm help a lot — text them to us. We&rsquo;ll walk the property and come back with a
              drawn plan and a fixed price.
            </p>
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
            <LeadForm service="Drainage & Trenching" submitLabel="Request My Free Drainage Bid" />
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA STRIP ── */}
      <section data-cta-location="footer-cta" className="bg-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Fix the water first. Then build something worth keeping dry.
          </h2>
          <p className="text-primary-100/80 mb-7 max-w-2xl mx-auto">
            Drainage pairs naturally with our other foothill work. Explore it, or open the design tool
            to see your yard thirty years out.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { href: "/water-smart-landscaping", label: "Water-Smart", cta: "explore-water" },
              { href: "/irrigation", label: "Irrigation", cta: "explore-irrigation" },
              { href: "/fire-wise-landscaping", label: "Fire-Wise", cta: "explore-fire" },
              { href: "/portfolio", label: "Portfolio", cta: "view-portfolio" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-cta={l.cta}
                className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/25 hover:bg-white/20 font-semibold text-sm transition"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/app"
              data-cta="open-design-tool"
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
