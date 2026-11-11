/**
 * The full service menu, grouped the way a homeowner thinks about a yard:
 * things you build, things you plant, and the water-and-care work that keeps
 * both alive. The header mega-menu, the mobile menu, the footer, and the
 * homepage service index all read from this one list, so a new service page
 * shows up everywhere by adding one entry here.
 *
 * Each group leads with a real job photo — never stock.
 */
import {
  Droplets,
  Fence,
  Flame,
  FlaskConical,
  Hammer,
  BrickWall,
  Layers,
  Leaf,
  PencilRuler,
  Sprout,
  Waves,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ServiceLink {
  href: string;
  label: string;
  /** One line under the label in the mega-menu and the homepage index. */
  blurb: string;
  icon: LucideIcon;
  /** GA4 cta_id for clicks from the menus. */
  cta: string;
}

export interface ServiceGroup {
  id: string;
  title: string;
  /** Short promise shown under the group photo. */
  tagline: string;
  image: string;
  imageAlt: string;
  /** CSS object-position for the wide menu crop, so the subject stays in frame. */
  imagePosition: string;
  links: ServiceLink[];
}

export const serviceGroups: ServiceGroup[] = [
  {
    id: "build",
    title: "Hardscape & Carpentry",
    tagline: "Built in-house, not subbed out",
    image: "/portfolio/redwood-deck.jpg",
    imageAlt: "Ground-level redwood deck with a picture-frame border and boxed stair",
    imagePosition: "50% 78%",
    links: [
      {
        href: "/portfolio?type=decks-carpentry#work",
        label: "Decks & Redwood Carpentry",
        blurb: "Decks, stairs, and timber structures",
        icon: Hammer,
        cta: "menu-decks-carpentry",
      },
      {
        href: "/portfolio?type=fences-gates#work",
        label: "Fences & Gates",
        blurb: "Redwood privacy, picket, and wire",
        icon: Fence,
        cta: "menu-fences-gates",
      },
      {
        href: "/portfolio?type=walls-grading#work",
        label: "Retaining Walls & Grading",
        blurb: "Slopes turned into usable yard",
        icon: BrickWall,
        cta: "menu-walls-grading",
      },
      {
        href: "/portfolio?type=patios-stonework#work",
        label: "Patios & Stonework",
        blurb: "Flagstone, paths, and edging",
        icon: Layers,
        cta: "menu-patios-stonework",
      },
    ],
  },
  {
    id: "landscape",
    title: "Landscape Design & Planting",
    tagline: "Designed for foothill soil and summers",
    image: "/home/whitney-oaks-after.jpg",
    imageAlt: "Replanted drought-tolerant front yard in Whitney Oaks, Rocklin",
    imagePosition: "50% 60%",
    links: [
      {
        href: "/#services",
        label: "Landscape Design-Build",
        blurb: "One crew from plan to planting",
        icon: PencilRuler,
        cta: "menu-design-build",
      },
      {
        href: "/fire-wise-landscaping",
        label: "Fire-Wise & Defensible Space",
        blurb: "Zone 0 work that still looks designed",
        icon: Flame,
        cta: "menu-fire-wise",
      },
      {
        href: "/water-smart-landscaping",
        label: "Water-Smart & Turf Conversion",
        blurb: "Drought-tolerant, rebate-ready yards",
        icon: Droplets,
        cta: "menu-water-smart",
      },
      {
        href: "/native-low-maintenance",
        label: "Low-Maintenance Native Gardens",
        blurb: "Plantings that take care of themselves",
        icon: Leaf,
        cta: "menu-native",
      },
    ],
  },
  {
    id: "care",
    title: "Drainage, Irrigation & Care",
    tagline: "The work that keeps a yard alive",
    image: "/menu/irrigation-repair.jpg",
    imageAlt: "Irrigation valve manifold and supply lines exposed in a trench during a repair",
    imagePosition: "50% 35%",
    links: [
      {
        href: "/drainage-trenching",
        label: "Drainage & French Drains",
        blurb: "Standing water and soggy lawns, fixed",
        icon: Waves,
        cta: "menu-drainage",
      },
      {
        href: "/irrigation",
        label: "Irrigation Install & Repair",
        blurb: "Valves, drip, and smart timers",
        icon: Wrench,
        cta: "menu-irrigation",
      },
      {
        href: "/fertilization",
        label: "Fertilization & Soil Health",
        blurb: "Liquid feeding for lawns and trees",
        icon: FlaskConical,
        cta: "menu-fertilization",
      },
      {
        href: "/plant-care",
        label: "Tree & Plant Health Care",
        blurb: "Diagnosis, pruning, and pest management",
        icon: Sprout,
        cta: "menu-plant-care",
      },
    ],
  },
];

/** Every service link in menu order — for flat lists such as the footer. */
export const allServiceLinks: ServiceLink[] = serviceGroups.flatMap((g) => g.links);
