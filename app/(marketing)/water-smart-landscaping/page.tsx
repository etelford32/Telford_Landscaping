import type { Metadata } from "next";
import { Droplets, Banknote, Sprout } from "lucide-react";
import LeadPageTemplate, { type LeadPageContent } from "@/components/LeadPageTemplate";

export const metadata: Metadata = {
  title: "Water-Smart Landscaping | Drought-Tolerant Design & Turf Rebates — Sacramento Foothills",
  description:
    "Water-smart, drought-tolerant landscaping for Granite Bay, Loomis, Auburn, and Roseville. Native and Mediterranean palettes, efficient drip irrigation, and turf conversions that qualify for local water-agency rebates. Request a free bid.",
  keywords:
    "water-smart landscaping, drought-tolerant landscape Granite Bay, turf rebate California, lawn conversion rebate, drip irrigation Loomis, low water landscaping Sacramento foothills, native plant design",
  openGraph: {
    title: "Water-Smart Landscaping — Beautiful Yards That Barely Drink",
    description:
      "Drought-tolerant design, efficient drip irrigation, and rebate-qualifying turf conversions for the foothills.",
    type: "website",
  },
};

const content: LeadPageContent = {
  eyebrow: "Water-Smart · Drought-Tolerant",
  title: "Beautiful yards that barely {{drink}}.",
  intro:
    "Natives and Mediterranean palettes matched to foothill soil, drip irrigation tuned by season, and turf conversions that qualify for local water-agency rebates. Lush is a design choice — thirsty doesn't have to be.",
  heroImage: {
    src: "/home/whitney-oaks-after.jpg",
    alt: "Drought-tolerant foothill frontage planted with natives and Mediterranean species",
  },
  facts: [
    { stat: "Rebates", label: "many California agencies pay for lawn conversion" },
    { stat: "Winter rain", label: "established natives can live largely on rainfall" },
    { stat: "By season", label: "drip irrigation tuned to how plants actually grow" },
  ],
  featuresHeading: "Low water, high design",
  featuresLede:
    "Cutting water use is a planting and irrigation problem — and both are ours to solve. We design for the foothills' hot, dry summers and wet winters.",
  features: [
    {
      icon: Sprout,
      title: "Drought-tolerant planting design",
      body: "Native and Mediterranean palettes chosen for foothill soil, sun, and slope.",
      points: [
        "California natives and proven low-water performers",
        "Specified by species and mature size",
        "Mulch and soil-building to hold moisture",
      ],
    },
    {
      icon: Banknote,
      title: "Turf conversion & rebates",
      body: "Remove thirsty lawn and replace it with a landscape that earns money back.",
      points: [
        "Turf removal and regrading",
        "Rebate-qualifying designs, paperwork handled",
        "Decomposed granite and permeable surfaces",
      ],
    },
    {
      icon: Droplets,
      title: "Efficient drip irrigation",
      body: "Water goes to the roots, on a schedule that follows the seasons — not the calendar.",
      points: [
        "Drip design, install, tuning, and repair",
        "Smart controllers and zone-by-zone scheduling",
        "Leak and coverage audits on existing systems",
      ],
    },
  ],
  pitchHeading: "Lush is a design choice",
  pitchBody: [
    "A water-smart yard isn't a cactus and a gravel field. The right natives and Mediterranean plants give you color, structure, and shade through the year while using a fraction of the water a lawn demands.",
    "We handle the parts most homeowners dread — the turf removal, the rebate paperwork, and the irrigation retrofit — and tune the system by season so established plantings can lean on winter rain.",
  ],
  pitchImage: {
    src: "/home/service-design-build.jpg",
    alt: "Established drought-tolerant planting with decomposed granite pathways",
  },
  service: "Water-Smart / Drought-Tolerant",
  formHeading: "Get a free water-smart bid",
  formLede:
    "Thinking about losing the lawn or cutting the water bill? Call or text for the fastest answer, or send the form and we'll reach out within one business day — rebate options included.",
};

export default function WaterSmartPage() {
  return <LeadPageTemplate content={content} />;
}
