import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Phone, Mail } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import BeforeAfterSlider from "@/components/home/BeforeAfterSlider";
import CaliforniaTabs from "@/components/home/CaliforniaTabs";
import PortfolioCarousel from "@/components/home/PortfolioCarousel";
import LeadForm from "@/components/LeadForm";

const services = [
  {
    img: "/home/service-design-build.jpg",
    alt: "Flagstone patio and outdoor living space",
    title: "Landscape Design-Build",
    body: "We design the landscape, build it, and stand behind it for the next thirty years. California natives, drought-tolerant palettes, and mature trees set at scale.",
    points: [
      "Computational 30-year design simulation",
      'Mature tree installation (up to 60" box)',
      "Native and drought-tolerant palettes",
    ],
    link: { label: "Start a design", href: "#contact" },
  },
  {
    img: "/home/service-hardscape.jpg",
    alt: "Engineered block retaining wall on a graded slope",
    title: "Heavy Hardscape",
    body: "Retaining walls, grading, and stonework in Sierra granite and cast block. Forged iron gates and cedar fences milled long and joined tight. Built once, to last.",
    points: [
      "Engineered retaining walls",
      "Custom gates and fencing",
      "Stone, steel, and masonry work",
    ],
    link: { label: "Get a bid", href: "#contact" },
  },
  {
    img: "/home/service-stewardship.jpg",
    alt: "Garden pathway through established planting",
    title: "Landscape Stewardship",
    body: "A landscape is a living thing. We stay with the ones we build — pruning on schedule, tuning irrigation as plants mature, keeping soil biology alive. Thirty-year landscapes need thirty-year attention.",
    points: [
      "Seasonal pruning and care",
      "Irrigation tuning and soil health",
      "Long-term relationship contracts",
    ],
    link: { label: "Ask about care", href: "#contact" },
  },
];

const portfolioSlides = [
  {
    src: "/home/portfolio-hillside-stairs.jpg",
    alt: "Redwood hillside stairs with block retaining wall",
    title: "Hillside stairs & wall",
    meta: "Redwood · block",
  },
  {
    src: "/home/portfolio-garden-arch.jpg",
    alt: "Custom redwood garden arch and gate",
    title: "Garden arch & gate",
    meta: "Custom redwood",
  },
  {
    src: "/home/portfolio-nature-gate.jpg",
    alt: "Rustic timber nature gate",
    title: "Nature gate",
    meta: "Rustic timber",
  },
  {
    src: "/home/portfolio-cedar-fence.jpg",
    alt: "Cedar privacy fence along slope",
    title: "Cedar fence",
    meta: "Milled long, joined tight",
  },
  {
    src: "/home/portfolio-fence-clearing.jpg",
    alt: "Cedar fence line enclosing cleared yard",
    title: "Fence & clearing",
    meta: "Full enclosure",
  },
  {
    src: "/home/portfolio-timber-carport.jpg",
    alt: "Timber-frame carport built into hillside",
    title: "Timber carport",
    meta: "Built into the hillside",
  },
];

export default function Home() {
  return (
    <>
      {/* ── HERO ── */}
      <header className="border-b border-earth-200 bg-gradient-to-b from-white via-primary-50 to-earth-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div>
            <div className="text-[12.5px] font-semibold tracking-[0.22em] uppercase text-primary-700 mb-5">
              {siteConfig.cities.slice(0, 4).join(" · ")}
            </div>
            <h1 className="text-[clamp(32px,3.9vw,50px)] font-extrabold tracking-tight text-gray-900 leading-[1.14] mb-5">
              Estate landscapes, <em className="not-italic text-primary-700">built by hand</em> in the
              Sacramento foothills.
            </h1>
            <p className="text-[17px] text-gray-600 mb-8 max-w-[46ch] leading-relaxed">
              Design-build for Granite Bay, Loomis, and Auburn. Heavy hardscape, mature trees, and
              thirty-year planting plans — one shop, one set of hands, start to finish.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#contact"
                className="btn-3d inline-flex items-center gap-2.5 bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-500 hover:to-green-500 text-white font-semibold px-7 py-3.5 rounded-xl"
              >
                Request Free Consultation <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={siteConfig.phoneHref}
                className="btn-3d btn-3d-dark inline-flex items-center gap-2.5 bg-white text-primary-800 font-semibold px-7 py-3.5 rounded-xl border-[1.5px] border-earth-200"
              >
                <Phone className="w-4 h-4" /> {siteConfig.phone}
              </a>
            </div>
            <div className="mt-7 text-[12.5px] tracking-wide text-gray-500 font-medium">
              {siteConfig.license} · Bonded &amp; Insured ·{" "}
              <a href={siteConfig.phoneHref} className="text-primary-800 font-semibold">
                {siteConfig.phone}
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="frame-earth rotate-[0.6deg]">
              <Image
                src="/home/hero-redwood-deck.jpg"
                alt="Redwood deck built beneath oak canopy in the Sierra foothills"
                width={880}
                height={660}
                priority
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute left-2.5 sm:-left-3.5 bottom-6 bg-white border border-earth-200 rounded-xl px-[18px] py-3 shadow-[0_12px_28px_-14px_rgba(20,26,18,0.35)] text-[13px] font-semibold text-gray-900 leading-snug">
              Redwood deck, Sierra foothills
              <span className="block text-[11.5px] font-medium text-gray-500">
                Designed &amp; built in-house · 2026
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── WHITNEY OAKS before / after ── */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-white via-primary-50 to-earth-50">
        <div className="max-w-6xl mx-auto px-6">
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
              <div className="text-sm text-gray-500 border-t border-earth-200 pt-4 leading-[2.1]">
                <b className="text-gray-900 font-semibold">Scope</b> — planting design, soil rebuild,
                drip irrigation
                <br />
                <b className="text-gray-900 font-semibold">Palette</b> — natives &amp; Mediterranean,
                low water
                <br />
                <b className="text-gray-900 font-semibold">Horizon</b> — designed for year thirty
              </div>
              <p className="mt-5">
                <Link href="#contact" className="text-primary-700 font-semibold hover:underline">
                  Want this result? Request a bid →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUILT FOR CALIFORNIA — Fire-Wise / Water-Smart / Native ── */}
      <section className="pb-20 lg:pb-24 pt-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Built for California
            </div>
            <h2 className="text-[clamp(27px,3.2vw,38px)] font-extrabold tracking-tight text-gray-900 mb-3.5">
              Landscapes for How the Foothills Actually Live
            </h2>
            <p className="text-[16.5px] text-gray-600">
              Water restrictions, fire country, and weekends you&rsquo;d rather spend enjoying the yard
              than working in it. Every Telford design answers all three.
            </p>
          </div>
          <CaliforniaTabs />
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-20 lg:py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Services
            </div>
            <h2 className="text-[clamp(27px,3.2vw,38px)] font-extrabold tracking-tight text-gray-900 mb-3.5">
              What We Do
            </h2>
            <p className="text-[16.5px] text-gray-600">
              Estate-scale landscape design-build. Designed and built by the same hands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 text-left">
            {services.map((s) => (
              <div
                key={s.title}
                className="group bg-white border-2 border-earth-300 rounded-2xl p-2.5 shadow-[0_10px_26px_-16px_rgba(20,26,18,0.3)] hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-18px_rgba(20,83,45,0.35)] transition"
              >
                <Image
                  src={s.img}
                  alt={s.alt}
                  width={640}
                  height={480}
                  className="aspect-[4/3] w-full object-cover rounded-lg shadow-[0_0_0_1px_#e8dcc4]"
                />
                <div className="px-3.5 pt-5 pb-3.5">
                  <h3 className="text-[19px] font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-[14.5px] text-gray-600 mb-3">{s.body}</p>
                  <ul className="space-y-1.5 mb-4">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-[13.5px] text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={s.link.href} className="text-primary-700 font-semibold text-sm hover:underline">
                    {s.link.label} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT WORK carousel ── */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-white via-primary-50 to-earth-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
              Recent Work
            </div>
            <h2 className="text-[clamp(27px,3.2vw,38px)] font-extrabold tracking-tight text-gray-900 mb-3.5">
              Built by Hand, in the Foothills
            </h2>
            <p className="text-[16.5px] text-gray-600">
              Decks, steps, gates, fences, and structures — carpentry is part of the shop, not a
              subcontract.
            </p>
          </div>
          <PortfolioCarousel slides={portfolioSlides} />
          <div className="mt-10 flex justify-center">
            <Link
              href="/portfolio"
              className="btn-3d btn-3d-dark inline-flex items-center gap-2 bg-white text-primary-800 font-semibold px-7 py-3.5 rounded-xl border-[1.5px] border-earth-200"
            >
              See the Full Portfolio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEW ── */}
      <section className="py-20 lg:py-24 border-y border-earth-200 bg-gradient-to-b from-earth-50 to-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
            What Clients Say
          </div>
          <h2 className="text-[clamp(27px,3.2vw,38px)] font-extrabold tracking-tight text-gray-900">
            Trusted With Valuable Properties
          </h2>
          <div className="max-w-[820px] mx-auto mt-11 bg-white border-2 border-earth-300 rounded-2xl px-8 py-11 md:px-[52px] shadow-[0_18px_40px_-22px_rgba(20,26,18,0.3)]">
            <div className="text-yellow-500 text-xl tracking-[4px] mb-[18px]">★★★★★</div>
            <blockquote className="text-[19px] leading-[1.75] text-gray-900 font-medium mb-[22px]">
              &ldquo;We waited a long time for someone like Elliot to come around to maintain and take
              care of our yard properly. The property is valuable and many of the trees need expert
              care. Elliot has done a tremendous job in restoring the various areas in the yard to turn
              it into a low maintenance sanctuary for our family.&rdquo;
            </blockquote>
            <div className="text-sm font-bold text-primary-800">
              Bill
              <span className="block font-medium text-gray-500 text-[13px] mt-0.5">
                Homeowner &amp; veteran · Sacramento foothills
              </span>
            </div>
            <span className="inline-block mt-[22px] text-[13.5px] text-gray-500">
              Google reviews — coming soon
            </span>
          </div>
        </div>
      </section>

      {/* ── DESIGN TOOL ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-br from-primary-800 to-primary-900 text-white rounded-3xl px-8 py-12 md:px-14 md:py-[52px] flex flex-col md:flex-row gap-9 items-start md:items-center justify-between shadow-[0_26px_52px_-22px_rgba(20,83,45,0.5)]">
            <div className="max-w-2xl">
              <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-300 mb-3.5">
                Part of Every Design
              </div>
              <h2 className="text-[26px] font-extrabold tracking-tight mb-2.5">See Your Yard in 2055</h2>
              <p className="text-[15.5px] text-primary-100/90 leading-relaxed">
                Every plan is simulated thirty years out with real growth models for California
                natives — valley oak, Japanese maple, Atlas cedar. Try it on your own yard, free. If
                you like what you see, we&rsquo;ll build it.
              </p>
            </div>
            <Link
              href="/app"
              className="btn-3d btn-3d-dark inline-flex items-center gap-2 bg-white text-primary-900 font-bold px-8 py-4 rounded-xl whitespace-nowrap hover:bg-primary-50"
            >
              Open the Design Tool <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="pb-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-[12.5px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-3.5">
            Contact
          </div>
          <h2 className="text-[clamp(27px,3.2vw,38px)] font-extrabold tracking-tight text-gray-900 mb-4">
            Start a Conversation
          </h2>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
            <div>
              <p className="text-[16.5px] text-gray-600 mb-6 leading-relaxed">
                If you&rsquo;re planning an estate landscape in Granite Bay, Loomis, or the Sacramento
                foothills, tell us about the property. We&rsquo;ll be in touch.
              </p>
              <a href={siteConfig.phoneHref} className="block border-t border-earth-200 py-[18px] group">
                <span className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-1">
                  <Phone className="w-3.5 h-3.5" /> Call or Text
                </span>
                <span className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition">
                  {siteConfig.phone}
                </span>
              </a>
              <a href={`mailto:${siteConfig.email}`} className="block border-t border-earth-200 py-[18px] group">
                <span className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-1">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition break-all">
                  {siteConfig.email}
                </span>
              </a>
              <div className="border-t border-earth-200 py-[18px]">
                <span className="block text-[11.5px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-1">
                  License
                </span>
                <span className="text-[15px] font-semibold text-gray-900">
                  {siteConfig.license} · Bonded &amp; Insured
                </span>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-earth-200 bg-gradient-to-br from-primary-50/60 to-earth-50 p-6 md:p-8">
              <LeadForm service="Homepage — consultation request" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
