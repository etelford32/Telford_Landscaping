import type { Metadata } from "next";
import { Leaf, Bug, CalendarClock } from "lucide-react";
import LeadPageTemplate, { type LeadPageContent } from "@/components/LeadPageTemplate";

export const metadata: Metadata = {
  title: "Low-Maintenance Native Landscaping | California Native Gardens — Sacramento Foothills",
  description:
    "Low-maintenance, California native landscape design for Granite Bay, Loomis, Auburn, and Roseville. Native plantings that resist local pests, hold their shape, and get better every year — a sanctuary that cares for itself. Request a free bid.",
  keywords:
    "California native landscaping, low-maintenance landscape Granite Bay, native plant garden Loomis, low water native design, pollinator garden Sacramento foothills, self-sustaining landscape",
  openGraph: {
    title: "Low-Maintenance Native Landscaping — A Sanctuary That Cares for Itself",
    description:
      "California native and low-water plantings designed to resist pests, hold their shape, and improve every year.",
    type: "website",
  },
};

const content: LeadPageContent = {
  eyebrow: "Low-Maintenance · California Native",
  title: "A sanctuary that takes care of {{itself}}.",
  intro:
    "The right plant in the right place doesn't need coddling. We design with California natives and proven low-water performers that resist local pests, hold their shape, and get better every year — so the yard works for you on Sunday, not the other way around.",
  heroImage: {
    src: "/home/service-stewardship.jpg",
    alt: "Established native planting along a garden pathway in the foothills",
  },
  facts: [
    { stat: "Less fuss", label: "natives resist local pests without constant spraying" },
    { stat: "4 seasons", label: "designed for year-round structure, not one photo" },
    { stat: "Year 30", label: "plantings that improve on their own schedule" },
  ],
  featuresHeading: "Designed to need you less",
  featuresLede:
    "Low-maintenance isn't neglect — it's good design. Right plant, right place, healthy soil, and a mulch layer that does the weeding for you.",
  features: [
    {
      icon: Leaf,
      title: "Native, low-maintenance planting plans",
      body: "Species chosen to thrive in foothill conditions and hold their shape without heavy pruning.",
      points: [
        "California natives and proven low-water performers",
        "Specified by species and mature size",
        "Grouped by water and sun needs for easy care",
      ],
    },
    {
      icon: Bug,
      title: "Soil biology & weed suppression",
      body: "Living soil and deep mulch that feed plants and crowd out weeds — less work, less spray.",
      points: [
        "Mulch and soil-biology programs",
        "Pest-resistant palettes that skip the chemicals",
        "Ground covers that fill in and stay put",
      ],
    },
    {
      icon: CalendarClock,
      title: "Optional seasonal stewardship",
      body: "Want it truly hands-off? We'll keep it dialed in on a light seasonal schedule.",
      points: [
        "Seasonal pruning and cleanup visits",
        "Irrigation checks as plantings mature",
        "Long-term care relationships, not one-and-done",
      ],
    },
  ],
  pitchHeading: "The yard works for you, not the other way around",
  pitchBody: [
    "A native landscape that's designed well spends its energy getting better, not just staying alive. Because the plants belong here, they shrug off local pests, live on far less water, and settle into a shape you don't have to fight every weekend.",
    "We plan for all four seasons — structure in winter, bloom in spring, shade in summer — and build the soil so the whole thing gains character year over year. Add optional stewardship visits and it's genuinely hands-off.",
  ],
  pitchImage: {
    src: "/home/whitney-oaks-after.jpg",
    alt: "Mature low-maintenance native landscape restored into a family sanctuary",
  },
  service: "Low-Maintenance Native",
  formHeading: "Get a free native-landscape bid",
  formLede:
    "Want a yard that looks after itself? Call or text for the fastest answer, or send the form and we'll reach out within one business day to talk through your property.",
};

export default function NativeLowMaintenancePage() {
  return <LeadPageTemplate content={content} />;
}
