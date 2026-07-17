import type { Metadata } from "next";
import { Flame, Shield, FileCheck } from "lucide-react";
import LeadPageTemplate, { type LeadPageContent } from "@/components/LeadPageTemplate";

export const metadata: Metadata = {
  title: "Fire-Wise Landscaping | Zone 0 Defensible Space — Granite Bay, Loomis, Auburn",
  description:
    "Fire-wise, defensible-space landscaping for the Sacramento foothills. Zone 0–2 compliant planting and hardscape that meets California's ember-resistant rules under AB 3074 — and still looks like a designed estate. Request a free bid.",
  keywords:
    "fire-wise landscaping, defensible space Granite Bay, Zone 0 landscaping, ember-resistant landscape, AB 3074, fire-resistant plants foothills, Loomis Auburn fire safe landscaping",
  openGraph: {
    title: "Fire-Wise Landscaping — Defensible Space, Designed",
    description:
      "Zone 0 compliance that looks like design, not demolition. Ember-resistant hardscape and fire-smart planting for foothill estates.",
    type: "website",
  },
};

const content: LeadPageContent = {
  eyebrow: "Fire-Wise · Defensible Space",
  title: "Defensible space that's still {{beautiful}}.",
  intro:
    "California's Zone 0 rules require an ember-resistant zone in the first five feet around foothill homes — and Loomis, Auburn, and Granite Bay sit in the severity zones where it applies. Most compliance work looks like demolition. Ours looks like design.",
  heroImage: {
    src: "/home/service-hardscape.jpg",
    alt: "Stone and steel hardscape forming an ember-resistant zone around a foothill home",
  },
  facts: [
    { stat: "First 5 ft", label: "ember-resistant Zone 0 required under AB 3074" },
    { stat: "2026", label: "enforcement begins for new structures, existing homes to follow" },
    { stat: "Zone 0–2", label: "we plan all three defensible-space zones together" },
  ],
  featuresHeading: "Compliance that looks like design",
  featuresLede:
    "The safest yard on the street should also be the best-looking one. We build defensible space out of good materials and the right plants — not bare dirt.",
  features: [
    {
      icon: Flame,
      title: "Ember-resistant ground zone",
      body: "The critical first five feet, rebuilt so wind-blown embers have nothing to catch.",
      points: [
        "Decomposed granite, stone, and steel at the ground-to-wall line",
        "Non-combustible mulch and hardscape transitions",
        "Gutters, fences, and gates detailed for ember resistance",
      ],
    },
    {
      icon: Shield,
      title: "Fire-smart planting design",
      body: "Well-spaced, high-moisture, low-resin plantings that stay lush without feeding fire.",
      points: [
        "Zone 0–2 compliant plant selection and spacing",
        "Irrigated green breaks placed where they matter",
        "Mature tree limbing and canopy separation",
      ],
    },
    {
      icon: FileCheck,
      title: "Insurance-ready documentation",
      body: "Photos, plans, and a materials record you can hand to your carrier or inspector.",
      points: [
        "Documented Zone 0 compliance package",
        "Before/after records of the work performed",
        "Guidance on maintaining compliance over time",
      ],
    },
  ],
  pitchHeading: "Built for fire country, without the scorched-earth look",
  pitchBody: [
    "Fire-wise doesn't have to mean gravel and nothing else. We use decomposed granite, dry-stacked stone, corten steel, and carefully chosen fire-resistant plantings to create a defensible perimeter that reads as intentional design.",
    "Every plan is drawn to the current Zone 0–2 standards for the foothills, then built by the same crew that draws it — so what passes inspection is also what you'll enjoy for the next thirty years.",
  ],
  pitchImage: {
    src: "/home/service-stewardship.jpg",
    alt: "Decomposed granite pathway and fire-resistant planting around an estate",
  },
  service: "Fire-Wise / Defensible Space",
  formHeading: "Get a free fire-wise bid",
  formLede:
    "Tell us about your property and we'll walk the defensible-space zones with you. Call or text for the fastest answer, or send the form and we'll reach out within one business day.",
};

export default function FireWisePage() {
  return <LeadPageTemplate content={content} />;
}
