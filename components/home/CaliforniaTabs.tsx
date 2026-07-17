"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface TabData {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  heading: string;
  body: string;
  points: string[];
  stats: { label: string; detail: string }[];
  href: string;
  cta: string;
}

const TABS: TabData[] = [
  {
    id: "fire",
    icon: "🔥",
    title: "Fire-Wise",
    tagline: "Defensible space that's still beautiful",
    heading: "Defensible space, designed — not stripped bare.",
    body: "California's Zone 0 rules now require an ember-resistant zone in the first five feet around foothill homes — and Loomis, Auburn, and Granite Bay sit in the fire severity zones where it applies. Most compliance work looks like demolition. Ours looks like design: decomposed granite, stone, steel, and fire-resistant plantings arranged so the safest yard on the street is also the best-looking one.",
    points: [
      "Zone 0–2 compliant planting & hardscape plans",
      "Ember-resistant materials at the ground-to-wall line",
      "Insurance-ready documentation of the work",
    ],
    stats: [
      { label: "First 5 feet", detail: "ember-resistant zone required under AB 3074" },
      { label: "Enforcement is here", detail: "new structures 2026, existing homes to follow" },
    ],
    href: "/fire-wise-landscaping",
    cta: "Explore Fire-Wise Work",
  },
  {
    id: "water",
    icon: "💧",
    title: "Water-Smart",
    tagline: "Drought-tolerant design & rebates",
    heading: "Beautiful yards that barely drink.",
    body: "Natives and Mediterranean palettes matched to foothill soil, drip irrigation tuned by season, and turf conversions that qualify for local water-agency rebates. Lush is a design choice — thirsty doesn't have to be.",
    points: [
      "Native & drought-tolerant planting design",
      "Turf removal with rebate paperwork handled",
      "Drip irrigation design, tuning & repair",
    ],
    stats: [
      { label: "Rebates available", detail: "many California agencies pay for lawn conversion" },
      { label: "Rainfall-adapted", detail: "established natives can live on winter rain" },
    ],
    href: "/water-smart-landscaping",
    cta: "Explore Water-Smart Work",
  },
  {
    id: "native",
    icon: "🌿",
    title: "Low-Maintenance Native",
    tagline: "A sanctuary that cares for itself",
    heading: "A sanctuary that takes care of itself.",
    body: "The right plant in the right place doesn't need coddling. We design with California natives and proven low-water performers that resist local pests, hold their shape, and get better every year — so the yard works for you on Sunday, not the other way around.",
    points: [
      "Low-maintenance planting plans by species & size",
      "Mulch & soil-biology programs that suppress weeds",
      "Optional stewardship visits on a seasonal schedule",
    ],
    stats: [
      { label: "Less pruning, spraying, fussing", detail: "natives resist local pests naturally" },
      { label: "Year-round structure", detail: "designed for all four seasons, not one photo" },
    ],
    href: "/native-low-maintenance",
    cta: "Explore Native Designs",
  },
];

export default function CaliforniaTabs() {
  const [active, setActive] = useState("fire");
  const activeTab = TABS.find((t) => t.id === active)!;

  return (
    <div className="mt-12 text-left">
      {/* tab buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" role="tablist" aria-label="California landscape approaches">
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.id)}
              className={`text-left rounded-2xl border-2 p-5 transition ${
                on
                  ? "border-primary-600 bg-primary-50 shadow-[0_12px_26px_-16px_rgba(20,83,45,0.4)]"
                  : "border-earth-300 bg-white hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-16px_rgba(20,83,45,0.35)]"
              }`}
            >
              <span className="block text-2xl leading-none mb-2.5">{t.icon}</span>
              <h3 className="text-[16.5px] font-bold text-gray-900 mb-1">{t.title}</h3>
              <span className={`text-[13px] ${on ? "text-primary-700" : "text-gray-500"}`}>{t.tagline}</span>
            </button>
          );
        })}
      </div>

      {/* active panel */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-[1.2fr_0.9fr] gap-8 md:gap-10 items-center rounded-2xl border-2 border-earth-300 bg-white p-8 md:px-9">
        <div>
          <h3 className="text-[22px] font-extrabold text-gray-900 mb-2.5">{activeTab.heading}</h3>
          <p className="text-[15px] text-gray-600 mb-3.5 leading-relaxed">{activeTab.body}</p>
          <ul className="space-y-2">
            {activeTab.points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-[18px] h-[18px] text-primary-600 mt-0.5 flex-shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:border-l border-earth-200 md:pl-9">
          {activeTab.stats.map((s) => (
            <div key={s.label} className="text-[13px] text-gray-500 mb-[18px] leading-relaxed">
              <b className="block text-[15px] text-gray-900">{s.label}</b>
              {s.detail}
            </div>
          ))}
          <Link
            href={activeTab.href}
            className="btn-3d inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-500 hover:to-green-500 text-white font-semibold text-[15px] px-6 py-3.5 rounded-xl"
          >
            {activeTab.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
