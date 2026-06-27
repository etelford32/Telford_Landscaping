import Link from "next/link";
import {
  TreePine,
  Wrench,
  Leaf,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Star,
  Phone,
  Mail,
  Palette,
  ChevronDown
} from "lucide-react";
import HeroCanvas from "@/components/HeroCanvas";
import ScrollSlider from "@/components/ScrollSlider";
import ContactForm from "@/components/ContactForm";
import TrackedLink from "@/components/TrackedLink";

export default function Home() {
  return (
    <>
      {/* ── HERO — full-viewport 3D landscape portal ── */}
      <section className="relative text-white overflow-hidden h-[calc(100vh-5rem)] min-h-[600px]">
        {/* 3D canvas fills the section */}
        <HeroCanvas />

        {/* Gradient vignette — bottom fade to let content anchor */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none z-10" />

        {/* Content overlay — anchored to bottom-left */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 px-4 sm:px-8 lg:px-12 pointer-events-none">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-primary-400" />
              <span className="text-primary-300 text-xs font-semibold tracking-widest uppercase">
                Granite Bay · Loomis · Sacramento Foothills
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.15] mb-5 drop-shadow-lg max-w-3xl">
              Landscapes designed to be more beautiful in thirty years than they are the day we plant them.
            </h1>

            <p className="text-white/85 text-base sm:text-lg mb-6 leading-relaxed max-w-2xl">
              Estate-scale landscape design-build for Granite Bay, Loomis, and the Sacramento foothills. Heavy hardscape, mature tree installation, and heritage landscapes. Built by hand, designed by science, meant to outlast us.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pointer-events-auto">
              <TrackedLink
                href="/app"
                ctaId="open_design_tool"
                ctaLocation="hero"
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-500 hover:to-green-500 text-white font-bold px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                See Your Yard in 2055
                <ArrowRight className="w-4 h-4" />
              </TrackedLink>
              <Link
                href="#contact"
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 hover:bg-white/25 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
              >
                Request a Consultation
              </Link>
              <Link
                href="/plants"
                className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white/90 font-medium px-5 py-3 rounded-xl transition-all duration-200 text-sm"
              >
                The Palette
              </Link>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: CheckCircle2, text: "CA C-27 Lic. #1156976 · Bonded & Insured" },
                { icon: MapPin,       text: "Granite Bay · Loomis · Auburn · Roseville" },
                { icon: Star,         text: "Design-Build. One shop." },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-white/65 text-xs">
                  <Icon className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator — bottom center */}
        <a
          href="#services"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors pointer-events-auto group"
          aria-label="Scroll to services"
        >
          <span className="text-xs tracking-widest uppercase font-medium">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </a>
      </section>

      {/* Fixed scroll slider */}
      <ScrollSlider />

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What We Do
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Estate-scale landscape design-build. Designed and built by the same hands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl border border-primary-100 hover:shadow-xl transition-shadow">
              <TreePine className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Landscape Design-Build</h3>
              <p className="text-gray-600 mb-4">
                Designed and built by the same hands. California natives, drought-tolerant palettes, mature trees set at scale. We design the landscape, build it, and stand behind it for the next thirty years.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Computational 30-year design simulation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Mature tree installation (up to 60&quot; box)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Native and drought-tolerant palettes</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-earth-50 to-white p-8 rounded-xl border border-earth-100 hover:shadow-xl transition-shadow">
              <Wrench className="w-12 h-12 text-earth-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Heavy Hardscape</h3>
              <p className="text-gray-600 mb-4">
                Retaining walls up to 100 feet. Forged iron gates. Cedar fences milled long and joined tight. Corten steel, Sierra granite, cast concrete. Built once, to last.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Engineered retaining walls</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Custom gates and fencing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Stone, steel, and masonry work</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl border border-primary-100 hover:shadow-xl transition-shadow">
              <Leaf className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Landscape Stewardship</h3>
              <p className="text-gray-600 mb-4">
                A landscape is a living thing. We stay with the ones we build. Pruning on the right schedule, adjusting irrigation as plants mature, keeping soil biology alive. Thirty-year landscapes need thirty-year attention.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Seasonal pruning and care</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Irrigation tuning and soil health</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Long-term relationship contracts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Section */}
      <section className="py-20 bg-gradient-to-br from-earth-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for the Sacramento Foothills
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Estate work in Granite Bay, Loomis, Auburn, Roseville, and Lincoln. Soils, microclimates, and valley oaks we know by hand.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {['Granite Bay', 'Loomis', 'Auburn', 'Roseville', 'Lincoln'].map((city) => (
              <div
                key={city}
                className="bg-white p-6 rounded-lg text-center shadow-md hover:shadow-xl transition-shadow border-2 border-primary-200 hover:border-primary-400"
              >
                <MapPin className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">{city}</h3>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-700 text-lg">
              Telford Projects LLC · CA C-27 Lic. #1156976 · Bonded &amp; Insured
            </p>
          </div>
        </div>
      </section>

      {/* See Your Yard in 2055 — design tool section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              See Your Yard in 2055
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 text-lg text-white/85 leading-relaxed text-left sm:text-center">
              <p>
                We built a design tool because clients kept asking the same question. <em>What will this actually look like when it grows in?</em> A five-gallon valley oak is a promise. We wanted to show the oak at forty feet, in 2055, before we dug the hole.
              </p>
              <p>
                Place plants, rotate and arrange hardscape, then run the simulation. The tool uses real growth models for California natives and estate-scale specimens. It&rsquo;s free to use. If you like what you see, we&rsquo;ll build it.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="font-bold text-xl mb-2">Thirty-year simulation</h3>
              <p className="text-white/80">Scrub a slider and watch the canopy fill in. A sapling in year one, a forty-foot oak in year thirty.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="font-bold text-xl mb-2">Place plants and hardscape</h3>
              <p className="text-white/80">Drag and rotate trees, walls, and gates in a 3D workspace. Snap to grid. Measure as you go.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="font-bold text-xl mb-2">Real growth models</h3>
              <p className="text-white/80">Valley oak, Japanese maple, Atlas cedar, Sawara cypress. Calibrated to foothill climate and soil.</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <TrackedLink
              href="/app"
              ctaId="open_design_tool"
              ctaLocation="design_tool_section"
              className="inline-block bg-white text-primary-900 px-10 py-5 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 text-lg"
            >
              Open the Design Tool
            </TrackedLink>
            <p className="mt-4 text-white/70">Free to use. If you like what you see, we&rsquo;ll build it.</p>
          </div>
        </div>
      </section>

      {/* Design to build */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Design and Build, Under One Roof
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The same hands that draw the plan set the stone. No subcontractor coordination on you. No phone trees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl border-2 border-primary-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary-600 p-3 rounded-full">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Design</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Site walk and property read</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Thirty-year growth simulation before install</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Native and drought-tolerant palette, specified by species and size</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-earth-50 to-white p-8 rounded-xl border-2 border-earth-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-earth-600 p-3 rounded-full">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Build</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Heavy hardscape in Sierra granite, corten, cedar, and iron</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Mature tree installation up to 60&quot; box, set by crane</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" />
                  <span>Stewardship after install. Thirty-year horizon.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="#contact"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Start a Conversation
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              If you&rsquo;re planning an estate landscape in Granite Bay, Loomis, or the Sacramento foothills, tell me about the property. I&rsquo;ll be in touch.
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-earth-50 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-primary-600 p-4 rounded-full">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Call</h3>
                  <p className="text-gray-700">Phone number coming soon</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary-600 p-4 rounded-full">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-700">info@telfordlandscapes.com</p>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
